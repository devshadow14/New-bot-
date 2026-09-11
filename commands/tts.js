const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.tts Bonjour tout le monde`" }, { quoted: m });
    }

    if (text.length > 200) {
        return await sock.sendMessage(from, { text: "❌ Texte trop long (max 200 caractères)." }, { quoted: m });
    }

    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=fr&q=${encodeURIComponent(text)}`;
        const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const buffer = Buffer.from(await response.arrayBuffer());

        await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg", ptt: true }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
