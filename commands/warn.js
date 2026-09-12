const { addWarning } = require("../lib/warnings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const target = quoted?.mentionedJid?.[0] || quoted?.participant;

    if (!target) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* Cite ou mentionne quelqu'un avec `.warn`" }, { quoted: m });
    }

    const { count, kicked } = addWarning(from, target);

    if (kicked) {
        try {
            await sock.groupParticipantsUpdate(from, [target], "remove");
            await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 *WARN* 〕━━━⬣\n┃ @${target.split("@")[0]} expulsé\n┃ (3 avertissements atteints)\n╰━━━━━━━━━━━━━━━━━━━━⬣`,
                mentions: [target]
            });
        } catch {
            await sock.sendMessage(from, {
                text: `⚠️ @${target.split("@")[0]} a atteint 3 avertissements, mais je n'ai pas pu l'expulser.`,
                mentions: [target]
            });
        }
    } else {
        await sock.sendMessage(from, {
            text: `╭━━━〔 ⚠️ *WARN* 〕━━━⬣\n┃ @${target.split("@")[0]}\n┃ Avertissement: ${count}/3\n╰━━━━━━━━━━━━━━━━━━━━⬣`,
            mentions: [target]
        });
    }
};
