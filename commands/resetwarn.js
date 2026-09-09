const settings = require("../settings");
const { resetWarning } = require("../lib/warnings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    try {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
        if (!admins.includes(sender) && !isOwner) {
            return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé aux admins." }, { quoted: m });
        }
    } catch {}

    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const target = quoted?.mentionedJid?.[0] || quoted?.participant;

    if (!target) {
        resetWarning(from, null);
        return await sock.sendMessage(from, { text: "✅ Tous les avertissements du groupe ont été réinitialisés." }, { quoted: m });
    }

    resetWarning(from, target);
    await sock.sendMessage(from, {
        text: `✅ Avertissements de @${target.split("@")[0]} réinitialisés.`,
        mentions: [target]
    }, { quoted: m });
};
