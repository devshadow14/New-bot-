const { fetchAnimeGif } = require("../lib/animeGif");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    try {
        const url = await fetchAnimeGif("waifu", "waifu");
        await sock.sendMessage(from, { image: { url }, caption: "🎌 *Waifu*" }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ API indisponible: ${error.message}` }, { quoted: m });
    }
};
