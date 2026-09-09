module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    try {
        await sock.groupSettingUpdate(from, "not_announcement");
        await sock.sendMessage(from, { text: "🔊 *Groupe unmute:* Tout le monde peut à nouveau écrire." }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: "❌ Échec. Vérifie que le bot est admin." }, { quoted: m });
    }
};
