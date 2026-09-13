const { generateLogo } = require("../lib/logoGen");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.light Ton Texte`" }, { quoted: m });
    }

    try {
        const buffer = await generateLogo(text, "light");
        await sock.sendMessage(from, {
            image: buffer,
            caption: `✨ *Logo "LIGHT"* généré !`
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
