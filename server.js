// const express = require('express');
import express from 'express';
// const fetch = require('node-fetch');
import fetch from 'node-fetch';
// const multer = require('multer');
import multer from 'multer';
// const fs = require('fs');
import fs from 'fs';
// const path = require('path');
import path from 'path';
const __dirname = path.resolve(path.dirname(''));

const app = express();
const port = 3000;

// Configuración de multer para la subida de archivos
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

// Middleware para permitir CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Ruta para manejar la generación de imágenes (ya existente)
app.post('/api/image/generation', async (req, res) => {
    try {
        const response = await fetch('https://api.limewire.com/api/image/generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Version': 'v1',
                'Accept': 'application/json',
                'Authorization': 'Bearer lmwr_sk_KhXLnRmhb6_lmtqJ95s3rmCgILnolL2Zh0ckuz6yDJzYC8ED'
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para manejar la subida de imágenes y la llamada a la API de escalado
app.post('/upscale', upload.single('image'), async (req, res) => {
    const { upscale_factor } = req.body;
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);

    try {
        const response = await fetch('https://api.example.com/upscale', {
            method: 'POST',
            headers: {
                'X-Api-Version': 'v1',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                image: fileStream,
                upscale_factor: upscale_factor
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        fs.unlinkSync(filePath); // Eliminar el archivo temporal después de procesarlo
        res.json({ url: data.url });
    } catch (error) {
        console.error('Error:', error);
        fs.unlinkSync(filePath); // Eliminar el archivo temporal en caso de error
        res.status(500).json({ error: 'Error al escalar la imagen' });
    }
});

// Ruta para la página principal
app.get('/escalar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'escalar-imagen.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'image-generator.html'));
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});

