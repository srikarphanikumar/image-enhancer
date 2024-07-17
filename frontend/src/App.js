// src/App.js
import React from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';

const App = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mt-10">Image Enhancer</h1>
            <ImageUploader />
        </div>
    );
};

export default App;
