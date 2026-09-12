const settings = require("../settings");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
        return await sock.sendMessage(from, { text: "❌ Cite une image, vidéo ou un statut à sauvegarder avec `.save`" }, { quoted: m });
    }

    const type = Object.keys(quoted)[0];
    const mediaTypes = { imageMessage: "image", videoMessage: "video", audioMessage: "audio", stickerMessage: "sticker" };

    if (!mediaTypes[type]) {
        return await sock.sendMessage(from, { text: "❌ Ce type de message ne peut pas être sauvegardé." }, { quoted: m });
    }

    try {
        const stream = await downloadContentFromMessage(quoted[type], mediaTypes[type]);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const ownerJid = settings.ownerNumber.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        const key = mediaTypes[type];

        await sock.sendMessage(ownerJid, {
            [key]: buffer,
            caption: key !== "sticker" && key !== "audio" ? "💾 Média sauvegardé" : undefined
        });

        await sock.sendMessage(from, {
            text: "╭━━━〔 💾 *SAVE* 〕━━━⬣\n┃ Sauvegardé dans tes messages privés.\n╰━━━━━━━━━━━━━━━━━━━━⬣"
        }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
