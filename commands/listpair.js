const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé au propriétaire." }, { quoted: m });
    }

    try {
        const { listActiveSessions } = require("../pairing-api");
        const sessions = listActiveSessions();

        if (sessions.length === 0) {
            return await sock.sendMessage(from, {
                text: "╭━━━〔 📋 *LISTPAIR* 〕━━━⬣\n┃ Aucune session web connectée.\n╰━━━━━━━━━━━━━━━━━━━━⬣"
            }, { quoted: m });
        }

        let text = `╭━━━〔 📋 *LISTPAIR* 〕━━━⬣\n`;
        sessions.forEach(num => { text += `┃ • ${num}\n`; });
        text += `┃\n┃ Total: ${sessions.length}\n╰━━━━━━━━━━━━━━━━━━━━⬣`;

        await sock.sendMessage(from, { text }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
