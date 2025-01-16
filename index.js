// Import required modules
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { initDB } from './db/initDB.js';
import config from './config.js';
import { fileURLToPath } from 'url';
import { FileStorage } from './db/models/FileStorage.js';
import { corsMiddleware } from './corsMiddleware.js';

// Initialize the database
initDB();

// Initialize Express app
const app = express();
const PORT = config.app.port;
const HOST = config.app.host;
app.use(corsMiddleware)

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDirectory)) fs.mkdirSync(uploadDirectory);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// POST /file/upload
app.post('/api/v1/file/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid file format or missing file' });
        }

        // Save file metadata to the database
        const fileRecord = await FileStorage.create({
            originalName: req.file.originalname,
            filePath: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size,
        });

        res.status(201).json({ fileId: fileRecord.fileId });
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).json({ error: 'Unexpected error during file upload' });
    }
});

// GET /file/{fileId}
app.get('/api/v1/file/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        if (isNaN(Number(fileId))) {
            return res.status(400).json({ error: 'Invalid fileId format' });
        }

        const fileRecord = await FileStorage.findByPk(fileId);
        if (!fileRecord) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.setHeader('Content-Type', fileRecord.mimeType);
        res.sendFile(path.resolve(fileRecord.filePath));
    } catch (error) {
        console.error('Error retrieving file:', error);
        res.status(500).json({ error: 'Unexpected server error' });
    }
});

// DELETE /file/{fileId}
app.delete('/api/v1/file/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        if (isNaN(Number(fileId))) {
            return res.status(400).json({ error: 'Invalid fileId format' });
        }

        const fileRecord = await FileStorage.findByPk(fileId);
        if (!fileRecord) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete the file from the file system
        fs.unlinkSync(fileRecord.filePath);

        // Remove file metadata from the database
        await FileStorage.destroy({ where: { fileId } });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Unexpected server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`File service is running on http://${HOST}:${PORT}/api/v1`);
});
