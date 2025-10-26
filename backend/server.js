import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/movies", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${query}`);
    const data = await response.json();

    if (data.Response === "False") {
      return res.status(404).json({ error: data.Error });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));