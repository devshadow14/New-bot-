const fetch = require("node-fetch");

/**
 * Récupère une URL de GIF/image anime.
 * Essaie nekos.best en premier, puis waifu.pics en secours si fourni.
 */
async function fetchAnimeGif(nekosEndpoint, waifuEndpoint) {
    if (nekosEndpoint) {
        try {
            const res = await fetch(`https://nekos.best/api/v2/${nekosEndpoint}`);
            if (res.ok) {
                const data = await res.json();
                if (data?.results?.[0]?.url) return data.results[0].url;
            }
        } catch (e) {
            console.error(`nekos.best error (${nekosEndpoint}): ${e.message}`);
        }
    }

    if (waifuEndpoint) {
        try {
            const res = await fetch(`https://api.waifu.pics/sfw/${waifuEndpoint}`);
            if (res.ok) {
                const data = await res.json();
                if (data?.url) return data.url;
            }
        } catch (e) {
            console.error(`waifu.pics error (${waifuEndpoint}): ${e.message}`);
        }
    }

    throw new Error("Aucune API disponible n'a répondu pour ce type de GIF.");
}

module.exports = { fetchAnimeGif };
