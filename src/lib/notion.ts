import { Client } from '@notionhq/client';
import { isMockMode } from '@/lib/use-mock';

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_METADATA_LENGTH = 1500;
const MOCK_MODE = isMockMode();

function normalizeText(input: unknown, fallback = ''): string {
    if (typeof input !== 'string') return fallback;
    return input.trim();
}

function maskEmail(email: string | null | undefined): string {
    if (!email) return 'N/A';
    if (typeof email !== 'string') return '***';
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    const maskedLocal = local.length > 2 ? `${local.substring(0, 2)}***` : '***';
    return `${maskedLocal}@${domain}`;
}

function maskSensitiveFields(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    const result = Array.isArray(obj) ? [] : {};
    Object.keys(obj).forEach((key) => {
        const val = obj[key];
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'email' || lowerKey === 'email_address') {
            (result as any)[key] = maskEmail(val);
        } else if (typeof val === 'object' && val !== null) {
            (result as any)[key] = maskSensitiveFields(val);
        } else {
            (result as any)[key] = val;
        }
    });
    return result;
}

function safeJson(value: unknown): string {
    if (value == null) return '';
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

type NotionErrorInfo = { code: string; message: string };

function normalizeNotionError(error: unknown): NotionErrorInfo {
    const fallback = { code: 'NOTION_UNKNOWN', message: 'Failed to insert Notion row' };
    if (error == null) return fallback;
    const record = error as { status?: number; code?: string; message?: string };
    const status = record.status;
    const message = typeof record.message === 'string' ? record.message : String(error);
    if (status === 401 || status === 403) {
        return { code: 'NOTION_UNAUTHORIZED', message };
    }
    if (status === 404) {
        return { code: 'NOTION_NOT_FOUND', message };
    }
    if (status === 429) {
        return { code: 'NOTION_RATE_LIMIT', message };
    }
    if (status && status >= 500) {
        return { code: 'NOTION_SERVER_ERROR', message };
    }
    if (record.code && typeof record.code === 'string') {
        return { code: record.code, message };
    }
    return { code: 'NOTION_UNKNOWN', message };
}

// Initialize the Notion client with the integration token
const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

export interface NotionLogData {
    category: 'QA_LOG' | 'USER_FEEDBACK' | 'PAYMENT_EVENT' | 'AUTH_EVENT' | 'ERROR';
    title: string;
    description: string;
    metadata?: any;
}

export interface NotionLogResult {
    success: boolean;
    id?: string;
    mocked?: boolean;
    error?: string;
}

/**
 * Inserts a new row into the Notion Database for structured indexing.
 * @param data The log data to insert
 */
export async function insertNotionRow(data: NotionLogData): Promise<NotionLogResult> {
    const title = normalizeText(data?.title, 'Untitled event');
    const description = normalizeText(data?.description, 'No description');
    const category = normalizeText(data?.category, 'ERROR');

    if (!DATABASE_ID || !process.env.NOTION_API_KEY) {
        if (MOCK_MODE) {
            console.log('[MOCK NOTION] Row inserted:', { ...data, title, description });
            return { success: true, mocked: true };
        }
        const message = 'Notion API Key or Database ID is missing';
        console.warn(`${message}. Skipping Notion logging.`);
        return { success: false, error: message };
    }

    const maskedMetadata = data.metadata ? maskSensitiveFields(data.metadata) : null;
    const safeMetadata = maskedMetadata ? safeJson(maskedMetadata).substring(0, MAX_METADATA_LENGTH) : '';
    const metadataText = safeMetadata ? `\n\nMetadata:\n${safeMetadata}` : '';
    const normalizedDescription = `${description}${metadataText}`.substring(0, MAX_DESCRIPTION_LENGTH);

    const toKoreanCategory = (rawCategory: string) => {
        const upper = rawCategory.toUpperCase();
        const allowed = ['QA_LOG', 'USER_FEEDBACK', 'PAYMENT_EVENT', 'AUTH_EVENT', 'ERROR'];
        return allowed.includes(upper) ? upper : 'ERROR';
    };

    const buildProperties = (desc: string, titleText: string, categoryValue: string) => ({
        Title: {
            title: [{
                text: {
                    content: titleText.substring(0, 200),
                },
            }],
        },
        Category: {
            select: {
                name: categoryValue,
            },
        },
        Description: {
            rich_text: [{
                text: {
                    content: desc.substring(0, MAX_DESCRIPTION_LENGTH),
                },
            }],
        },
        Timestamp: {
            date: {
                start: new Date().toISOString(),
            },
        },
    });

    const createWithFallback = async (baseTitle: string, baseDesc: string, baseCategory: string, fieldCandidates: string[][]) => {
        let lastError: any = null;
        for (let i = 0; i < fieldCandidates.length; i += 1) {
            const fieldSet = fieldCandidates[i];
            const props = buildProperties(baseDesc, baseTitle, baseCategory);
            const selectedProps: Record<string, unknown> = {};
            fieldSet.forEach((field) => {
                if (field in props) {
                    selectedProps[field] = (props as Record<string, unknown>)[field];
                }
            });
            try {
                const response = await notion.pages.create({
                    parent: { database_id: DATABASE_ID },
                    // eslint-disable-next-line
                    properties: selectedProps as any,

                });
                return { success: true, id: response.id };
            } catch (error) {
                lastError = error;
                if (error instanceof Error && error.message?.includes('Could not find property')) {
                    continue;
                }
                break;
            }
        }
        const normalized = normalizeNotionError(lastError);
        return { success: false, error: `[${normalized.code}] ${normalized.message}` };
    };

    const normalizedCategory = toKoreanCategory(category);
    const fallbackCandidateSets = [
        ['Title', 'Category', 'Description', 'Timestamp'],
        ['Name', 'Category', 'Description', 'Timestamp'],
        ['Title', 'Description', 'Timestamp'],
        ['Name', 'Description', 'Timestamp'],
        ['Description', 'Timestamp'],
        ['Title'],
    ];

    try {
        return await createWithFallback(
            title,
            normalizedDescription,
            normalizedCategory,
            fallbackCandidateSets,
        );
    } catch (error) {
        console.error('Failed to insert Notion row:', error);
        const result = await createWithFallback(title, normalizedDescription, normalizedCategory, [['Description', 'Timestamp'], ['Description']]);
        if (result.success) {
            return result;
        }
        const normalized = normalizeNotionError(error);
        return { success: false, error: `[${normalized.code}] ${normalized.message}` };
    }
}
