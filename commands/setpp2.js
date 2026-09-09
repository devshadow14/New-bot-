const settings = require("../settings");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    try {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
        if (!admins.includes(sender) && !isOwner) {
            return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé aux admins." }, { quoted: m });
        }
    } catch {}

    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = quoted?.imageMessage || m.message?.imageMessage;

    if (!imageMsg) {
        return await sock.sendMessage(from, { text: "❌ Cite ou envoie une image avec `.setpp2`" }, { quoted: m });
    }

    try {
        const stream = await downloadContentFromMessage(imageMsg, "image");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        await sock.updateProfilePicture(from, buffer);
        await sock.sendMessage(from, { text: "✅ Photo de profil du groupe mise à jour !" }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
