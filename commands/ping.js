const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const start = Date.now();

    const newsletterInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363430627819748@newsletter",
            newsletterName: settings.botName,
            serverMessageId: -1
        }
    };

    const sent = await sock.sendMessage(from, { text: "🏓 Ping..." }, { quoted: m });
    const speed = Date.now() - start;

    const text = `╭━━━〔 🏓 *PONG* 〕━━━⬣\n┃ ⚡ *Vitesse:* ${speed}ms\n╰━━━━━━━━━━━━━━━━━━━━⬣`;

    await sock.sendMessage(from, { text, edit: sent.key }).catch(async () => {
        await sock.sendMessage(from, { text, contextInfo: newsletterInfo }, { quoted: m });
    });
};
