const fs = require('fs');
const path = require('path');

// Path to your PDFs folder
const pdfDir = path.join(__dirname, '..', 'pdfs');

// Path to your metadata JSON
const metadataPath = path.join(__dirname, '..', 'data', 'pdfMetadata.json');

let cachedList = null;

function getPdfList() {
    if (cachedList) return cachedList;

    // Read all PDF filenames
    const pdfFiles = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

    // Load metadata file
    let metadata = {};
    if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }

    // Build final list
    cachedList = pdfFiles.map(filename => ({
        filename,
        title: metadata[filename]?.title || filename,
        description: metadata[filename]?.description || "No description available"
    }));

    return cachedList;
}

module.exports = { getPdfList };
