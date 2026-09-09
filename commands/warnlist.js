const { getWarnings, MAX_WARNINGS } = require("../lib/warnings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    const warnings = getWarnings(from);
    const entries = Object.entries(warnings).filter(([, count]) => count > 0);

    if (entries.length === 0) {
        return await sock.sendMessage(from, { text: "✅ Aucun membre averti dans ce groupe." }, { quoted: m });
    }

    const mentions = entries.map(([jid]) => jid);
    let text = `⚠️ *LISTE DES AVERTISSEMENTS*\n\n`;
    entries.forEach(([jid, count]) => {
        text += `• @${jid.split("@")[0]} — ${count}/${MAX_WARNINGS}\n`;
    });

    await sock.sendMessage(from, { text, mentions }, { quoted: m });
};
