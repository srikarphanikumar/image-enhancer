import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const ImageUploader = () => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [enhancedImage, setEnhancedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processType, setProcessType] = useState('grayscale');
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);
    const [debugInfo, setDebugInfo] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    }, []);

    const handleProcessTypeChange = (e) => {
        setProcessType(e.target.value);
    };

    const handleEnhanceImage = async () => {
        setLoading(true);
        setDebugInfo('');
        const formData = new FormData();
        formData.append('image', image);
        formData.append('processType', processType);
        formData.append('brightness', brightness);
        formData.append('contrast', contrast);

        try {
            const response = await axios.post('http://localhost:5001/api/enhance-image', formData, {
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setDebugInfo(prev => prev + `Response received. Status: ${response.status}\n`);
            setDebugInfo(prev => prev + `Content-Type: ${response.headers['content-type']}\n`);

            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('image/png')) {
                const blob = new Blob([response.data], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                setEnhancedImage(url);
                setDebugInfo(prev => prev + `Image processed successfully. URL: ${url}\n`);

                // Log the first few bytes of the image data
                const uint8Array = new Uint8Array(response.data);
                const hexString = Array.from(uint8Array.slice(0, 16), byte => byte.toString(16).padStart(2, '0')).join(' ');
                setDebugInfo(prev => prev + `First 16 bytes of image data: ${hexString}\n`);
            } else {
                // If not image/png, try to parse as JSON
                const textDecoder = new TextDecoder('utf-8');
                const jsonText = textDecoder.decode(response.data);
                try {
                    const jsonResponse = JSON.parse(jsonText);
                    setDebugInfo(prev => prev + `Received JSON response: ${JSON.stringify(jsonResponse)}\n`);
                } catch (jsonError) {
                    setDebugInfo(prev => prev + `Received non-JSON response: ${jsonText}\n`);
                }
            }
        } catch (error) {
            console.error('Error enhancing image:', error);
            setDebugInfo(prev => prev + `Error: ${error.message}\n`);
            if (error.response) {
                setDebugInfo(prev => prev + `Response status: ${error.response.status}\n`);
                setDebugInfo(prev => prev + `Response headers: ${JSON.stringify(error.response.headers)}\n`);
            }
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="flex flex-col items-center min-h-screen w-full bg-gray-800 text-white p-4">
            <h1 className="text-4xl font-bold mb-8">Image Enhancer</h1>
            <div className="flex flex-col lg:flex-row justify-between w-full max-w-full bg-gray-700 p-4 rounded-lg shadow-lg">
                <div className="w-full lg:w-1/3 p-4 mb-4 lg:mb-0">
                    <div
                        {...getRootProps()}
                        className={`w-full h-64 p-6 border-4 border-dashed rounded-lg cursor-pointer bg-gray-200 ${isDragActive ? 'border-blue-500' : 'border-gray-400'}`}
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p className="text-center text-gray-500">Drop the files here...</p>
                        ) : (
                            <p className="text-center text-gray-500">Drag 'n' drop some files here, or click to select files</p>
                        )}
                    </div>
                    {imagePreview && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-gray-200">Selected Image:</h3>
                            <img src={imagePreview} alt="Selected" className="mt-2 w-full h-48 object-contain border border-gray-300 rounded-lg" />
                        </div>
                    )}
                </div>
                <div className="w-full lg:w-1/3 flex flex-col items-center p-4">
                    <select
                        value={processType}
                        onChange={handleProcessTypeChange}
                        className="mb-4 p-2 border rounded-md text-black w-full max-w-xs"
                    >
                        <option value="grayscale">Grayscale</option>
                        <option value="sepia">Sepia</option>
                        <option value="invert">Invert</option>
                        <option value="blur">Blur</option>
                        <option value="sharpen">Sharpen</option>
                        <option value="brightness">Brightness/Contrast</option>
                        <option value="edges">Edge Detection</option>
                        <option value="emboss">Emboss</option>
                    </select>
                    <div className="flex flex-col items-center w-full max-w-xs">
                        <label className="text-white w-full">Brightness</label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={brightness}
                            onChange={(e) => setBrightness(e.target.value)}
                            className="mb-4 w-full"
                        />
                        <label className="text-white w-full">Contrast</label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={contrast}
                            onChange={(e) => setContrast(e.target.value)}
                            className="mb-4 w-full"
                        />
                    </div>
                    <button
                        onClick={handleEnhanceImage}
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 w-full max-w-xs"
                    >
                        {loading ? 'Enhancing...' : 'Enhance Image'}
                    </button>
                </div>
                <div className="w-full lg:w-1/3 p-4">
                    {enhancedImage && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-200">Enhanced Image:</h2>
                            <img src={enhancedImage} alt="Enhanced" className="mt-2 w-full h-auto object-contain border border-gray-300 rounded-lg" />
                        </div>
                    )}
                    {debugInfo && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-gray-200">Debug Info:</h3>
                            <pre className="mt-2 p-2 bg-gray-600 rounded text-xs text-gray-200 whitespace-pre-wrap overflow-x-auto">
                                {debugInfo}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageUploader;