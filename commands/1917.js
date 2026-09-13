const { generateLogo } = require("../lib/logoGen");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.1917 Ton Texte`" }, { quoted: m });
    }

    try {
        const buffer = await generateLogo(text, "1917");
        await sock.sendMessage(from, {
            image: buffer,
            caption: `✨ *Logo "1917"* généré !`
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
