const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (args.length < 2) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.translate en Bonjour tout le monde`\n(code langue + texte)" }, { quoted: m });
    }

    const targetLang = args[0];
    const text = args.slice(1).join(" ");

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();

        const translated = data[0].map(chunk => chunk[0]).join("");
        const detectedLang = data[2];

        await sock.sendMessage(from, {
            text: `╭━━━〔 🌐 *TRADUCTION* 〕━━━⬣\n┃ 📥 (${detectedLang}) ${text}\n┃ 📤 (${targetLang}) ${translated}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
