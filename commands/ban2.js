const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");

    await sock.sendMessage(from, {
        text:
            `╭━━━〔 🚫 *BAN 2* 〕━━━⬣\n` +
            `┃ Cette fonctionnalité est\n┃ réservée, veuillez contacter\n┃ le propriétaire du bot.\n┃\n` +
            `┃ 📱 wa.me/${ownerNumber}\n` +
            `╰━━━━━━━━━━━━━━━━━━━━⬣`
    }, { quoted: m });
};
