import { chromium } from 'playwright';

export async function createBrowserRuntime({
    viewport = { width: 1440, height: 900 },
    headless = true,
    channel = 'msedge',
} = {}) {
    const cdpEndpoint = process.env.CHROME_CDP_URL || process.env.PLAYWRIGHT_CDP_URL;
    const shouldUseCDP = !!cdpEndpoint && process.env.CHROME_FORCE_LAUNCH !== 'true';

    if (shouldUseCDP) {
        const browser = await chromium.connectOverCDP(cdpEndpoint);
        const [existingContext] = browser.contexts();
        if (existingContext) {
            return {
                browser,
                context: existingContext,
                closeBrowser: async () => {
                    await existingContext.close().catch(() => {});
                },
            };
        }

        const context = await browser.newContext({ viewport });
        return {
            browser,
            context,
            closeBrowser: async () => {
                await context.close().catch(() => {});
                await browser.close();
            },
        };
    }

    const runtimeHeadless =
        process.env.HEADLESS === 'false' ? false : headless;
    const runtimeChannel = process.env.PLAYWRIGHT_CHANNEL || channel;
    const browser = await chromium.launch({
        channel: runtimeChannel,
        headless: runtimeHeadless,
    });
    const context = await browser.newContext({ viewport });

    return {
        browser,
        context,
        closeBrowser: async () => {
            await context.close().catch(() => {});
            await browser.close().catch(() => {});
        },
    };
}
