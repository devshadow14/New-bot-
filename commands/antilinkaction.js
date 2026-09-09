const settings = require("../settings");
const { readDb, writeDb, getGroupConfig } = require("../lib/db");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    const choice = (args[0] || "").toLowerCase();
    if (!["delete", "kick", "warn"].includes(choice)) {
        return await sock.sendMessage(from, {
            text: "❌ *Usage:* `.antilinkaction delete` / `kick` / `warn`"
        }, { quoted: m });
    }

    try {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
        if (!admins.includes(sender) && !isOwner) {
            return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé aux admins." }, { quoted: m });
        }
    } catch {}

    const db = readDb();
    const group = getGroupConfig(db, from);
    group.antilinkAction = choice;
    writeDb(db);

    await sock.sendMessage(from, {
        text: `🛡️ *Action AntiLink définie sur:* \`${choice}\``
    }, { quoted: m });
};
