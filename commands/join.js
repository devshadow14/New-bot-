const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé au propriétaire." }, { quoted: m });
    }

    const link = args[0];
    if (!link || !link.includes("chat.whatsapp.com/")) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.join https://chat.whatsapp.com/xxxxx`" }, { quoted: m });
    }

    const code = link.split("chat.whatsapp.com/")[1]?.split("?")[0];

    try {
        await sock.groupAcceptInvite(code);
        await sock.sendMessage(from, { text: "✅ J'ai rejoint le groupe avec succès !" }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Impossible de rejoindre: ${error.message}` }, { quoted: m });
    }
};
