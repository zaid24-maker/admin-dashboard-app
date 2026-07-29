const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'client', 'src');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Split into lines to do safer replacements
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                if (line.includes('http://localhost:5001')) {
                    // Scenario A: Exact string match: 'http://localhost:5001'
                    if (line.match(/'http:\/\/localhost:5001'/)) {
                        line = line.replace(/'http:\/\/localhost:5001'/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5001')");
                    }
                    // Scenario B: URL string literal: 'http://localhost:5001/api/endpoint'
                    else if (line.match(/'http:\/\/localhost:5001[^']+'/)) {
                        line = line.replace(/'http:\/\/localhost:5001([^']+)'/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:5001'}$1`");
                    }
                    // Scenario C: Already in template literal: `http://localhost:5001/api/endpoint`
                    else if (line.match(/http:\/\/localhost:5001/)) {
                        line = line.replace(/http:\/\/localhost:5001/g, "${import.meta.env.VITE_API_URL || 'http://localhost:5001'}");
                    }
                }

                lines[i] = line;
            }

            content = lines.join('\n');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Perfectly Refactored: ${fullPath}`);
            }
        }
    }
}

processDir(srcDir);
console.log('Done refactoring correctly.');
