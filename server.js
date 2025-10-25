const API_KEY = process.env.OMDB_API_KEY;

app.get('/movies', async (req, res) => {
  const { q, id } = req.query;
  let url;

  if (q) {
    url = `http://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${API_KEY}`;
  } else if (id) {
    url = `http://www.omdbapi.com/?i=${encodeURIComponent(id)}&apikey=${API_KEY}`;
  } else {
    return res.json({ error: "No query provided" });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("OMDB fetch failed:", err);
    res.json({ error: "Failed to fetch from OMDB" });
  }
});