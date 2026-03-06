const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}', { nodir: true });
let changedCount = 0;

for (const file of files) {
    if (file === 'src/lib/use-mock.ts') continue;

    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    if (content.includes('NEXT_PUBLIC_USE_MOCK_DATA')) {
        content = content.replace(/process\.env\.NEXT_PUBLIC_USE_MOCK_DATA === 'true'/g, 'isMockMode()');
        content = content.replace(/process\.env\.NEXT_PUBLIC_USE_MOCK_DATA !== 'true'/g, '!isMockMode()');

        // Add import statement if we replaced anything
        if (content !== originalContent && !content.includes('import { isMockMode }')) {
            const importStatement = "import { isMockMode } from '@/lib/use-mock';\n";

            // Find the last import line or just add to top
            const importRegex = /^import\s+.*?[\r\n]/gm;
            let lastMatch;
            let m;
            while ((m = importRegex.exec(content)) !== null) {
                lastMatch = m;
            }

            if (lastMatch) {
                const index = lastMatch.index + lastMatch[0].length;
                content = content.slice(0, index) + importStatement + content.slice(index);
            } else {
                content = importStatement + content;
            }
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
}

console.log(`Updated ${changedCount} files.`);
