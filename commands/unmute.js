const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    try {
        await sock.groupSettingUpdate(from, "not_announcement");
        await sock.sendMessage(from, {
            text: "╭━━━〔 🔊 *GROUPE UNMUTE* 〕━━━⬣\n┃ Tout le monde peut à nouveau écrire.\n╰━━━━━━━━━━━━━━━━━━━━⬣",
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363430627819748@newsletter",
                    newsletterName: settings.botName,
                    serverMessageId: -1
                }
            }
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: "❌ Échec. Vérifie que le bot est admin." }, { quoted: m });
    }
};
