import { Client } from '@notionhq/client';

/**
 * Notion API Client Integration
 * Implements "Zero Script QA" log collection and User Operation Logging.
 */

// Initialize the Notion client with the integration token
const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

export interface NotionLogData {
    category: 'QA_LOG' | 'USER_FEEDBACK' | 'PAYMENT_EVENT' | 'ERROR';
    title: string;
    description: string;
    metadata?: any;
}

/**
 * Inserts a new row into the Notion Database for structured indexing.
 * @param data The log data to insert
 */
export async function insertNotionRow(data: NotionLogData) {
    if (!DATABASE_ID || !process.env.NOTION_API_KEY) {
        if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
            console.log('[MOCK NOTION] Row inserted:', data);
            return { success: true, mocked: true };
        }
        console.warn('Notion API Key or Database ID is missing. Skipping Notion logging.');
        return { success: false, error: 'Credentials Missing' };
    }

    try {
        const response = await notion.pages.create({
            parent: {
                database_id: DATABASE_ID,
            },
            properties: {
                Title: {
                    title: [
                        {
                            text: {
                                content: data.title,
                            },
                        },
                    ],
                },
                Category: {
                    select: {
                        name: data.category,
                    },
                },
                Description: {
                    rich_text: [
                        {
                            text: {
                                content: data.description.substring(0, 2000), // Notion limit is 2000 per block
                            },
                        },
                    ],
                },
                Timestamp: {
                    date: {
                        start: new Date().toISOString(),
                    },
                },
            },
        });

        return { success: true, id: response.id };
    } catch (error) {
        console.error('Failed to insert Notion row:', error);
        return { success: false, error };
    }
}
