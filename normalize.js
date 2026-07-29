const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'client', 'src');

function cleanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            cleanDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Replace all forms of import.meta.env.VITE_API_URL logic back to raw localhost
            content = content.replace(/\\\$\{import\.meta\.env\.VITE_API_URL[^\}]+\}/g, 'http://localhost:5001');
            content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL[^\}]+\}/g, 'http://localhost:5001');
            content = content.replace(/\(import\.meta\.env\.VITE_API_URL[^\)]+\)/g, "'http://localhost:5001'");
            content = content.replace(/`'http:\/\/localhost:5001'/g, "`http://localhost:5001");

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Cleaned: ${fullPath}`);
            }
        }
    }
}
cleanDir(srcDir);
