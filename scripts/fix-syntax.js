const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDirs = ['src/app', 'src/components'];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

function fixJsxComments(content) {
    // Finds instances of // SOME_TEXT inside JSX and wraps the // in {"//"} carefully.
    // Extremely basic regex for the specific errors we saw:
    // e.g. // PHASE_FIRE -> {"//"} PHASE_FIRE
    // // DECODING_ASYNC_DREAM_BUFFER_V2.0 -> {"//"} DECODING_ASYNC_DREAM_BUFFER_V2.0

    // We only want to target specific known broken comments that caused the build to fail
    return content
        .replace(/\/\/ PHASE_/g, '{"//"} PHASE_')
        .replace(/\/\/ DECODING_/g, '{"//"} DECODING_')
        .replace(/\/\/ ENCRYPTED_/g, '{"//"} ENCRYPTED_');
}

function fixCorruptedKorean(content) {
    // The previous agent/encoding corrupted some specific strings in saju and history.
    // We will fix the known ones.
    return content
        .replace(/\?명/g, '운명')
        .replace(/\?이\?\?로그/g, '데이터 로그')
        .replace(/\?신\?\?\?구\?던 모든 \?명\?\?\?적\?\?br \/>/g, '당신이 탐구했던 모든 운명의 흔적을<br />')
        .replace(/\?\?라\?에\?\?\?시 \?인\?세\?\?/g, '타임라인에서 다시 확인하세요.')
        .replace(/\?독 기록 검\?\?\.\./g, '해독 기록 검색...')
        .replace(/\?묒옄由?/g, '양자리')
        .replace(/\?⑹냼\?먮━/g, '황소자리')
        .replace(/\?띾뫁\?댁옄由?/g, '쌍둥이자리')
        .replace(/寃뚯옄由?/g, '게자리')
        .replace(/\?ъ옄\?먮━/g, '사자자리')
        .replace(/泥섎\?\?\먮━/g, '처녀자리')
        .replace(/泥쒖묶\?먮━/g, '천칭자리')
        .replace(/\?\꾧컝\?먮━/g, '전갈자리')
        .replace(/\?ъ닔\?먮━/g, '사수자리')
        .replace(/\?쇱냼\?먮━/g, '염소자리')
        .replace(/臾쇰퀝\?먮━/g, '물병자리')
        .replace(/臾쇨퀬湲곗옄由?/g, '물고기자리');
}

function run() {
    let files = [];
    targetDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            files = getAllFiles(dir, files);
        }
    });

    let fixedCount = 0;

    files.forEach(file => {
        const originalContent = fs.readFileSync(file, 'utf8');
        let newContent = fixJsxComments(originalContent);
        newContent = fixCorruptedKorean(newContent);

        if (originalContent !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`[FIXED] ${file}`);
            fixedCount++;
        }
    });

    console.log(`\nCompleted. Fixed ${fixedCount} files.`);
}

run();
