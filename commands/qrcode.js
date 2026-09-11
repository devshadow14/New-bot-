const QRCode = require("qrcode");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.qrcode Ton texte ou lien ici`" }, { quoted: m });
    }

    try {
        const buffer = await QRCode.toBuffer(text, { width: 512, margin: 2 });
        await sock.sendMessage(from, {
            image: buffer,
            caption: `╭━━━〔 🔳 *QR CODE* 〕━━━⬣\n┃ ${text.slice(0, 60)}${text.length > 60 ? "..." : ""}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
