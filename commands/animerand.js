const { fetchAnimeGif } = require("../lib/animeGif");

const RANDOM_POOL = [
    { nekos: "waifu", waifu: "waifu" },
    { nekos: "neko", waifu: "neko" },
    { nekos: null, waifu: "megumin" },
    { nekos: null, waifu: "awoo" }
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const pick = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];

    try {
        const url = await fetchAnimeGif(pick.nekos, pick.waifu);
        await sock.sendMessage(from, { image: { url }, caption: "🎲 *Anime Random*" }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ API indisponible: ${error.message}` }, { quoted: m });
    }
};
