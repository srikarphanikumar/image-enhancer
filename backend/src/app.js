// backend/src/app.js
const express = require('express');
const multer = require('multer');
const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001; // Change the port to 5001 or another available port

app.use(cors());
app.use(express.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Simple image processing function (placeholder for a real model)
const enhanceImage = async (inputBuffer) => {
    const outputBuffer = await sharp(inputBuffer).grayscale().toBuffer();
    return outputBuffer;
};

app.post('/api/enhance-image', upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);

        // Enhance the image using the placeholder function
        const enhancedImageBuffer = await enhanceImage(imageBuffer);

        // Send the enhanced image back to the client
        res.type('jpeg').send(enhancedImageBuffer);

        // Clean up uploaded image
        fs.unlinkSync(imagePath);
    } catch (error) {
        console.error('Error enhancing image:', error);
        res.status(500).json({ error: 'Error enhancing image' });
    }
});

// Serve the frontend index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
