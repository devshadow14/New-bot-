const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé au propriétaire." }, { quoted: m });
    }

    try {
        await sock.sendMessage(from, {
            text:
                `╭━━━〔 👋 *AU REVOIR* 〕━━━⬣\n` +
                `┃ Merci pour ce moment passé\n` +
                `┃ ensemble ! Je quitte ce groupe\n` +
                `┃ mais on se retrouvera peut-être\n` +
                `┃ ailleurs un jour 🚀\n` +
                `┃\n` +
                `┃ *${settings.botName}* — à bientôt ✨\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: m });

        await new Promise(r => setTimeout(r, 1500));
        await sock.groupLeave(from);

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
