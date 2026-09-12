const settings = require("../settings");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const viewOnce = quoted?.viewOnceMessage?.message || quoted?.viewOnceMessageV2?.message || quoted;

    const type = viewOnce ? Object.keys(viewOnce).find(k => k === "imageMessage" || k === "videoMessage") : null;

    if (!type) {
        return await sock.sendMessage(from, { text: "❌ Cite un message *vue unique* (image ou vidéo) avec `.vv2`" }, { quoted: m });
    }

    try {
        const mediaType = type === "imageMessage" ? "image" : "video";
        const stream = await downloadContentFromMessage(viewOnce[type], mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const ownerJid = settings.ownerNumber.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

        await sock.sendMessage(ownerJid, { [mediaType]: buffer, caption: "👁️ Vue unique récupérée" });

        await sock.sendMessage(from, {
            text: "╭━━━〔 👁️ *VV2* 〕━━━⬣\n┃ Envoyé en privé.\n╰━━━━━━━━━━━━━━━━━━━━⬣"
        }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
