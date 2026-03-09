import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { insertNotionRow } from '@/lib/integrations/notion';

const INQUIRY_NOTION_RETRY_COUNTER = new Map<string, number>();
const MAX_MESSAGE_LENGTH = 1000;
const BASE_NOTION_RETRY_DELAY_SECONDS = 30;
const MAX_NOTION_RETRY_DELAY_SECONDS = 300;

type InquiryErrorCode =
  | 'MISSING_REQUIRED_FIELDS'
  | 'MESSAGE_TOO_LONG'
  | 'INVALID_CATEGORY'
  | 'DB_INSERT_FAILED'
  | 'NOTION_LOG_FAILED'
  | 'INQUIRY_INTERNAL_ERROR';

const createPayload = (errorCode: InquiryErrorCode, message: string, details?: unknown) => ({
  error: message,
  error_code: errorCode,
  ...(details ? { details } : {}),
});

const shouldRetryNotion = (errorCode: InquiryErrorCode): 'transient' | 'none' =>
  errorCode === 'NOTION_LOG_FAILED' ? 'transient' : 'none';

const reportNotionFailure = async (input: {
  category: string;
  subject: string;
  userId: string | null;
  email?: string;
  message: string;
  reason: InquiryErrorCode;
}) => {
  const retryKey = `${input.category}:${input.reason}`;
  const nextRetryCount = (INQUIRY_NOTION_RETRY_COUNTER.get(retryKey) || 0) + 1;
  INQUIRY_NOTION_RETRY_COUNTER.set(retryKey, nextRetryCount);

  const notionResult = await insertNotionRow({
    category: 'USER_FEEDBACK',
    title: `[Inquiry] notion-log-failed (${input.category}): ${input.subject.substring(0, 80)}`,
    description: `Initial Notion logging failed. reason=${input.reason}, retry_count=${nextRetryCount}`,
    metadata: {
      category: input.category,
      subject: input.subject.substring(0, 140),
      userId: input.userId,
      email: input.email,
      messagePreview: input.message.substring(0, 1000),
      retry_count: nextRetryCount,
      retry_signal: shouldRetryNotion(input.reason),
      retry_after_seconds: Math.min(MAX_NOTION_RETRY_DELAY_SECONDS, BASE_NOTION_RETRY_DELAY_SECONDS * Math.pow(2, nextRetryCount - 1)),
    },
  });

  return { notionResult, nextRetryCount };
};

export async function POST(req: NextRequest) {
  try {
    const { category, subject, message, email } = await req.json();
    const normalizedMessage = typeof message === 'string' ? message.trim() : '';
    const normalizedSubject = typeof subject === 'string' ? subject.trim() : '';
    const normalizedCategory = typeof category === 'string' ? category.trim() : '';

    if (!normalizedCategory || !normalizedSubject || !normalizedMessage) {
      return NextResponse.json(
        createPayload('MISSING_REQUIRED_FIELDS', 'Missing required fields'),
        { status: 400 }
      );
    }

    if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        createPayload('MESSAGE_TOO_LONG', `Message exceeds ${MAX_MESSAGE_LENGTH} characters`),
        { status: 400 }
      );
    }

    const validCategories = ['error', 'feedback', 'review', 'refund', 'convert'];
    if (!validCategories.includes(normalizedCategory)) {
      return NextResponse.json(
        createPayload('INVALID_CATEGORY', 'Invalid inquiry category'),
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    let userId: string | null = null;
    try {
      const authResult = await getAuthenticatedUser(req);
      if (authResult.user) userId = authResult.user.id;
    } catch {}

    const finalSubject = normalizedSubject.substring(0, 200);
    const finalMessage = normalizedMessage.substring(0, MAX_MESSAGE_LENGTH);

    const { error: dbError } = await supabase.from('inquiries').insert({
      user_id: userId,
      email: email || null,
      category: normalizedCategory,
      subject: finalSubject,
      message: finalMessage,
      status: 'pending',
    });

    if (dbError) {
      console.error('[Inquiry] DB error:', dbError);
      return NextResponse.json(
        createPayload('DB_INSERT_FAILED', 'Failed to save inquiry', { dbError }),
        { status: 500 }
      );
    }

    const notionResult = await insertNotionRow({
      category: 'USER_FEEDBACK',
      title: `[Inquiry] ${normalizedCategory}: ${finalSubject}`,
      description: `User inquiry created. category=${normalizedCategory}, email=${email || 'N/A'}`,
      metadata: { category: normalizedCategory, subject: finalSubject, userId, email, messagePreview: finalMessage },
    });

    let notion_log_retry_count: number | null = null;
    let notion_log_retry_signal: 'transient' | 'none' | null = null;
    let notion_log_retry_after_seconds: number | null = null;
    if (!notionResult.success) {
      console.warn('[Inquiry] Notion log failed:', notionResult.error);
      const result = await reportNotionFailure({
        category: normalizedCategory,
        subject: finalSubject,
        userId,
        email,
        message: finalMessage,
        reason: 'NOTION_LOG_FAILED',
      });
      notion_log_retry_count = result.nextRetryCount;
      notion_log_retry_signal = shouldRetryNotion('NOTION_LOG_FAILED');
      notion_log_retry_after_seconds = Math.min(
        MAX_NOTION_RETRY_DELAY_SECONDS,
        BASE_NOTION_RETRY_DELAY_SECONDS * Math.pow(2, result.nextRetryCount - 1)
      );
    }

    return NextResponse.json({
      success: true,
      message: notionResult.success
        ? 'Inquiry submitted'
        : 'Inquiry saved, but Notion logging is currently unavailable. It will be retried by background process.',
      notion_log_ready: notionResult.success,
      notion_log_retry_count,
      notion_log_retry_signal,
      notion_log_retry_after_seconds: notion_log_retry_after_seconds || null,
    });
  } catch (err: any) {
    console.error('[Inquiry] Error:', err);
    return NextResponse.json(
      createPayload('INQUIRY_INTERNAL_ERROR', err.message || 'Unexpected error', { error: String(err) }),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, category, subject, status, created_at, admin_response')
      .eq('user_id', authResult.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ inquiries: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
