const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé au propriétaire." }, { quoted: m });
    }

    if (args.length < 2) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.send 221xxxxxxxxx Ton message ici`" }, { quoted: m });
    }

    const targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    const message = args.slice(1).join(" ");

    try {
        await sock.sendMessage(targetJid, { text: message });
        await sock.sendMessage(from, {
            text: "╭━━━〔 ✅ *SEND* 〕━━━⬣\n┃ Message envoyé.\n╰━━━━━━━━━━━━━━━━━━━━⬣"
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
