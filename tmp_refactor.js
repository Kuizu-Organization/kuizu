const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');

const filesToProcess = [
    'AdminModerationPage',
    'AuthPage',
    'ComingSoonPage',
    'FlashcardForm',
    'FlashcardSetDetailsPage',
    'FlashcardSetForm',
    'FlashcardSetsPage',
    'NotFoundPage',
    'ProfilePage',
    'QuizPage',
    'QuizResultPage',
    'StudyPage'
];

async function main() {
    try {
        const items = fs.readdirSync(pagesDir);
        for (const item of items) {
            const ext = path.extname(item);
            const baseName = path.basename(item, ext);
            
            if ((ext === '.jsx' || ext === '.css') && filesToProcess.includes(baseName)) {
                const oldPath = path.join(pagesDir, item);
                const newDir = path.join(pagesDir, baseName);
                const newPath = path.join(newDir, item);

                if (!fs.existsSync(newDir)) {
                    fs.mkdirSync(newDir);
                }

                if (ext === '.jsx') {
                    let content = fs.readFileSync(oldPath, 'utf8');
                    // Replace import statements pointing to parent dir
                    content = content.replace(/(from\s+['"]|import\s+['"])\.\.\//g, '$1../../');
                    fs.writeFileSync(newPath, content, 'utf8');
                } else if (ext === '.css') {
                    // Just copy css
                    fs.copyFileSync(oldPath, newPath);
                }
                
                // Delete old file
                fs.unlinkSync(oldPath);
                console.log(`Moved ${item} to ${baseName}/${item}`);
            }
        }

        // Update App.jsx
        let appContent = fs.readFileSync(appJsxPath, 'utf8');
        filesToProcess.forEach(page => {
            const regex = new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]\\.\\/pages\\/${page}['"];`, 'g');
            appContent = appContent.replace(regex, `import $1 from './pages/${page}/${page}';`);
        });
        fs.writeFileSync(appJsxPath, appContent, 'utf8');
        console.log('App.jsx updated.');

    } catch (err) {
        console.error(err);
    }
}

main();
