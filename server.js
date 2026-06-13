const express = require('express');
const path = require('path');
const app = express();

const PORT = 4000;

// Serve the static 'public' directory (Netlify does this automatically in production)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`GPL Mods Wake-Up server running at http://localhost:${PORT}`);
});