const { STYLES } = require("../lib/logoGen");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    const list = Object.keys(STYLES).map(s => `┃ • .${s}`).join("\n");

    const text =
        `╭━━━〔 📁 *LISTE DES LOGOS* 〕━━━⬣\n` +
        `${list}\n` +
        `┃\n` +
        `┃ 💡 *Usage:* .fire Mon Nom\n` +
        `╰━━━━━━━━━━━━━━━━━━━━⬣`;

    await sock.sendMessage(from, { text }, { quoted: m });
};
