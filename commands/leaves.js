const { generateLogo } = require("../lib/logoGen");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.leaves Ton Texte`" }, { quoted: m });
    }

    try {
        const buffer = await generateLogo(text, "leaves");
        await sock.sendMessage(from, {
            image: buffer,
            caption: `✨ *Logo "LEAVES"* généré !`
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
