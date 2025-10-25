require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/movies', async (req, res) => {
    const { q, id } = req.query;
    const API_KEY = process.env.OMDB_API_KEY;

    if (!q && !id) return res.status(400).json({ error: 'Provide ?q= or ?id=' });

    try {
        let url = '';
        if (id) {
            url = `https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`;
        } else {
            url = `https://www.omdbapi.com/?s=${q}&apikey=${API_KEY}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch from OMDB' });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
