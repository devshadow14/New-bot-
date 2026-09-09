const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé au propriétaire." }, { quoted: m });
    }

    if (!args[0]) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.unblock 221xxxxxxxxx`" }, { quoted: m });
    }

    const target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    try {
        await sock.updateBlockStatus(target, "unblock");
        await sock.sendMessage(from, { text: `✅ @${target.split("@")[0]} a été débloqué.`, mentions: [target] }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
