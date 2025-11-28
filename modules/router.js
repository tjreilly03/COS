const express = require('express');
const path = require('path');
const router = express.Router();

const { getPdfList } = require('./pdfDiscovery');
const { pdfExists } = require('./pdfValidation');

module.exports = (app) => {

    // Home page
    router.get('/', (req, res) => {
        res.redirect('/index');
    });

    // Show PDF list
    router.get('/pdfs', (req, res) => {
        const pdfs = getPdfList();
        res.render('pdfs', { pdfs });
    });

    // Serve PDF securely using sendFile()
    router.get('/pdf/:name', (req, res) => {
        const pdfName = req.params.name;

        if (!pdfExists(pdfName)) {
            return res.status(404).render('404', { message: "PDF not found" });
        }

        const filePath = path.join(__dirname, '..', 'pdfs', pdfName);
        return res.sendFile(filePath);
    });

    // 404 fallback
    router.use((req, res) => {
        res.status(404).render('404', { message: "Page not found" });
    });

    app.use(router);
};
