const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    try {
        await sock.groupSettingUpdate(from, "announcement");
        await sock.sendMessage(from, {
            text: "╭━━━〔 🔇 *GROUPE MUTE* 〕━━━⬣\n┃ Seuls les admins peuvent écrire.\n╰━━━━━━━━━━━━━━━━━━━━⬣",
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
