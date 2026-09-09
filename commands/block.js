const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé au propriétaire." }, { quoted: m });
    }

    const quoted = m.message?.extendedTextMessage?.contextInfo;
    let target = quoted?.mentionedJid?.[0] || quoted?.participant;

    if (!target && args[0]) {
        target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    }

    if (!target) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* Cite/mentionne quelqu'un ou `.block 221xxxxxxxxx`" }, { quoted: m });
    }

    try {
        await sock.updateBlockStatus(target, "block");
        await sock.sendMessage(from, { text: `🚫 @${target.split("@")[0]} a été bloqué.`, mentions: [target] }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
