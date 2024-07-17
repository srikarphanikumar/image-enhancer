// src/components/ImageUploader.js
import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
    const [image, setImage] = useState(null);
    const [enhancedImage, setEnhancedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e) => {
        setImage(e.target.files[0]);
    };

    const handleEnhanceImage = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post('http://localhost:5001/api/enhance-image', formData, {
                responseType: 'blob',
            });

            const url = URL.createObjectURL(response.data);
            setEnhancedImage(url);
        } catch (error) {
            console.error('Error enhancing image:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-10">
            <input
                type="file"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            <button
                onClick={handleEnhanceImage}
                className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
            >
                {loading ? 'Enhancing...' : 'Enhance Image'}
            </button>
            {enhancedImage && (
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold text-gray-700">Enhanced Image:</h2>
                    <img src={enhancedImage} alt="Enhanced" className="mt-4 border border-gray-300 rounded-lg" />
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
