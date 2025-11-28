const fs = require('fs');
const path = require('path');

function exists(pdfDirectory, filename) {
    if (!filename.endsWith('.pdf')) return false;

    const filePath = path.join(pdfDirectory, filename);

    try {
        return fs.existsSync(filePath);
    } catch (err) {
        console.error("PDF validation error:", err);
        return false;
    }
}

module.exports = { exists };
