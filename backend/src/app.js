const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Define a 4D kernel for edge detection
const edgeDetectionKernel = tf.tensor4d([
    [
        [[-1], [-1], [-1]],
        [[-1], [8], [-1]],
        [[-1], [-1], [-1]]
    ]
]);

const processImage = async (inputBuffer, processType, brightness = 1, contrast = 1) => {
    let outputBuffer;
    let imageTensor;

    try {
        // Log input image dimensions
        const inputImage = await sharp(inputBuffer);
        const inputMetadata = await inputImage.metadata();
        console.log('Input image dimensions:', inputMetadata.width, 'x', inputMetadata.height);

        imageTensor = tf.node.decodeImage(inputBuffer, 3);
        console.log('Tensor shape after decode:', imageTensor.shape);

        imageTensor = imageTensor.toFloat().expandDims(0);
        console.log('Tensor shape after processing:', imageTensor.shape);
    } catch (error) {
        console.error('Error decoding image to tensor:', error);
        throw new Error('Error decoding image to tensor');
    }

    try {
        switch (processType) {
            case 'grayscale':
                outputBuffer = await sharp(inputBuffer).grayscale().toBuffer();
                break;
            case 'sepia':
                outputBuffer = await sharp(inputBuffer).modulate({ saturation: 0.5, hue: 90 }).toBuffer();
                break;
            case 'invert':
                outputBuffer = await sharp(inputBuffer).negate().toBuffer();
                break;
            case 'blur':
                outputBuffer = await sharp(inputBuffer).blur(5).toBuffer();
                break;
            case 'sharpen':
                outputBuffer = await sharp(inputBuffer).sharpen().toBuffer();
                break;
            case 'brightness':
                outputBuffer = await sharp(inputBuffer).modulate({ brightness, contrast }).toBuffer();
                break;
            case 'edges':
                // Define a moderate edge detection kernel
                const edgeKernel = tf.tensor4d([
                    [
                        [[-1], [-1], [-1]],
                        [[-1], [8], [-1]],
                        [[-1], [-1], [-1]]
                    ]
                ]).div(8); // Normalize the kernel

                // Apply custom edge detection kernel
                const edges = imageTensor.squeeze().conv2d(edgeKernel, 1, 'same');
                console.log('Edges tensor shape:', edges.shape);

                // Normalize the result
                const minVal = edges.min();
                const maxVal = edges.max();
                const normalizedEdges = edges.sub(minVal).div(maxVal.sub(minVal));

                // Enhance edges while keeping the image visible
                const enhancedEdges = normalizedEdges.mul(0.8).add(0.2);

                // Convert to 8-bit integer
                const edgesInt = enhancedEdges.mul(255).clipByValue(0, 255).toInt();

                // Ensure the tensor is in the correct shape (height, width, channels)
                const reshapedResult = edgesInt.reshape([edgesInt.shape[0], edgesInt.shape[1], 1]);
                console.log('Reshaped result shape:', reshapedResult.shape);

                // Convert to RGB by repeating the single channel
                const rgbResult = reshapedResult.tile([1, 1, 3]);
                console.log('RGB result shape:', rgbResult.shape);

                // Transpose the image to fix rotation (if needed)
                const transposedResult = rgbResult.transpose([1, 0, 1]);
                console.log('Transposed result shape:', transposedResult.shape);

                outputBuffer = await tf.node.encodePng(transposedResult);

                // Log output image dimensions
                const outputImage = await sharp(outputBuffer);
                const outputMetadata = await outputImage.metadata();
                console.log('Output image dimensions:', outputMetadata.width, 'x', outputMetadata.height);
                break;
            case 'emboss':
                outputBuffer = await sharp(inputBuffer).convolve({
                    width: 3,
                    height: 3,
                    kernel: [
                        -2, -1, 0,
                        -1, 1, 1,
                        0, 1, 2
                    ]
                }).toBuffer();
                break;
            default:
                outputBuffer = inputBuffer;
                break;
        }
    } catch (error) {
        console.error(`Error processing image with ${processType}:`, error);
        throw new Error(`Error processing image with ${processType}`);
    }

    return outputBuffer;
};

app.post('/api/enhance-image', upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const { processType = 'grayscale', brightness = 1, contrast = 1 } = req.body;

        const enhancedImageBuffer = await processImage(imageBuffer, processType, parseFloat(brightness), parseFloat(contrast));

        res.set('Content-Type', 'image/png');
        res.send(Buffer.from(enhancedImageBuffer));  // Ensure we're sending a Buffer

        fs.unlinkSync(imagePath);
    } catch (error) {
        console.error('Error enhancing image:', error);
        res.status(500).json({ error: 'Error enhancing image' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});