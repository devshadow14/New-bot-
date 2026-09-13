const { fetchAnimeGif } = require("../lib/animeGif");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    try {
        // Endpoint incertain, tentative best-effort
        const url = await fetchAnimeGif("maid", null);
        await sock.sendMessage(from, { image: { url }, caption: "🎀 *Maid*" }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ API indisponible pour .maid: ${error.message}` }, { quoted: m });
    }
};
