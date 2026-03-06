import { NextResponse } from 'next/server';
import { APP_CONFIG, KAKAO_CONFIG, MCP_CONFIG, PAYMENT_CONFIG } from '@/config';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isMockMode } from '@/lib/use-mock';

export const dynamic = 'force-dynamic';

type CheckStatus = 'ok' | 'degraded' | 'fail';

type HealthCheck = {
  status: CheckStatus;
  message: string;
  duration_ms: number;
};

function elapsedMs(startMs: number) {
  return Date.now() - startMs;
}

async function runCheck(run: () => Promise<Omit<HealthCheck, 'duration_ms'>>): Promise<HealthCheck> {
  const startedAt = Date.now();
  try {
    const result = await run();
    return { ...result, duration_ms: elapsedMs(startedAt) };
  } catch (error) {
    return {
      status: 'fail',
      message: `unexpected_error:${error instanceof Error ? error.message : String(error)}`,
      duration_ms: elapsedMs(startedAt),
    };
  }
}

async function checkDatabase(): Promise<Omit<HealthCheck, 'duration_ms'>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { status: 'degraded', message: 'supabase_not_configured' };
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return { status: 'degraded', message: 'supabase_client_unavailable' };
  }

  const { error } = await client.from('users').select('id').limit(1);
  if (error) {
    return { status: 'fail', message: `supabase_query_failed:${error.code || 'unknown'}` };
  }

  return { status: 'ok', message: 'supabase_ok' };
}

function checkPaymentConfig(): Omit<HealthCheck, 'duration_ms'> {
  if (!PAYMENT_CONFIG.isConfigured) {
    return { status: 'degraded', message: 'payment_config_missing' };
  }

  if (PAYMENT_CONFIG.CLIENT_KEY) {
    return { status: 'ok', message: 'payment_config_ok' };
  }

  return { status: 'degraded', message: 'payment_client_key_missing' };
}

function checkMailConfig(): Omit<HealthCheck, 'duration_ms'> {
  const mockMode = isMockMode();
  if (mockMode) {
    return { status: 'ok', message: 'mail_mode_mocked' };
  }

  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  if (!hasResendKey) {
    return { status: 'degraded', message: 'mail_resend_key_missing' };
  }

  return { status: 'ok', message: 'mail_config_ok' };
}

function checkRuntimeEnv(): Omit<HealthCheck, 'duration_ms'> {
  const required = Boolean(process.env.NEXT_PUBLIC_BASE_URL || APP_CONFIG.BASE_URL);
  if (!required) {
    return { status: 'degraded', message: 'base_url_missing' };
  }

  const hasCronSecret = Boolean(process.env.CRON_SECRET);
  return hasCronSecret
    ? { status: 'ok', message: 'runtime_env_ok' }
    : { status: 'degraded', message: 'cron_secret_missing' };
}

function checkAppConfig(): Omit<HealthCheck, 'duration_ms'> {
  if (!APP_CONFIG.BASE_URL) {
    return { status: 'degraded', message: 'app_base_url_missing' };
  }

  if (APP_CONFIG.NAME && APP_CONFIG.VERSION) {
    return { status: 'ok', message: 'app_config_complete' };
  }

  return { status: 'degraded', message: 'app_config_partial' };
}

function checkPaymentConfigCompat(): Omit<HealthCheck, 'duration_ms'> {
  if (!PAYMENT_CONFIG.isConfigured) {
    return { status: 'degraded', message: 'payment_config_incomplete' };
  }

  if (PAYMENT_CONFIG.isTestMode) {
    return { status: 'degraded', message: 'payment_in_test_mode' };
  }

  return { status: 'ok', message: 'payment_config_ready' };
}

function checkAuthConfig(): Omit<HealthCheck, 'duration_ms'> {
  const kakaoReady = KAKAO_CONFIG.isConfigured;
  const mcpReady = MCP_CONFIG.isConfigured;

  if (kakaoReady || mcpReady) {
    return { status: 'ok', message: `auth_ready:kakao=${kakaoReady},mcp=${mcpReady}` };
  }

  return { status: 'degraded', message: 'auth_provider_not_configured' };
}

function checkCronConfig(): Omit<HealthCheck, 'duration_ms'> {
  const hasSecret = Boolean(process.env.CRON_SECRET);
  const hasBaseUrl = Boolean(process.env.CRON_BASE_URL || APP_CONFIG.BASE_URL);

  if (hasSecret && hasBaseUrl) {
    return { status: 'ok', message: 'cron_config_ok' };
  }

  return { status: 'degraded', message: 'cron_config_incomplete' };
}

function checkNotionConfig(): Omit<HealthCheck, 'duration_ms'> {
  const hasNotionApiKey = Boolean(process.env.NOTION_API_KEY);
  const hasNotionDbId = Boolean(process.env.NOTION_DATABASE_ID);

  if (!hasNotionApiKey || !hasNotionDbId) {
    return { status: 'degraded', message: 'notion_config_incomplete' };
  }

  return { status: 'ok', message: 'notion_config_ok' };
}

export async function GET() {
  const checks = {
    app: await runCheck(async () => ({ status: 'ok', message: 'service_running' })),
    database: await runCheck(checkDatabase),
    payment_config: await runCheck(async () => checkPaymentConfig()),
    payment_config_mode: await runCheck(async () => checkPaymentConfigCompat()),
    auth_config: await runCheck(async () => checkAuthConfig()),
    cron_config: await runCheck(async () => checkCronConfig()),
    runtime_env: await runCheck(async () => checkRuntimeEnv()),
    app_config: await runCheck(async () => checkAppConfig()),
    mail_config: await runCheck(async () => checkMailConfig()),
    notion_config: await runCheck(async () => checkNotionConfig()),
  };

  const values = Object.values(checks);
  const hasFailure = values.some((check) => check.status === 'fail');
  const hasDegraded = values.some((check) => check.status === 'degraded');
  const status: 'ok' | 'degraded' | 'fail' = hasFailure ? 'fail' : hasDegraded ? 'degraded' : 'ok';

  return NextResponse.json(
    {
      status,
      service: 'secret-saju',
      timestamp: new Date().toISOString(),
      uptime_sec: Math.floor(process.uptime()),
      checks,
    },
    { status: hasFailure ? 503 : 200 }
  );
}
