const { fetchAnimeGif } = require("../lib/animeGif");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    try {
        const url = await fetchAnimeGif("neko", "neko");
        await sock.sendMessage(from, { image: { url }, caption: "🐱 *Neko*" }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ API indisponible: ${error.message}` }, { quoted: m });
    }
};
