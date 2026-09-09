module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    try {
        await sock.groupSettingUpdate(from, "announcement");
        await sock.sendMessage(from, { text: "🔇 *Groupe mute:* Seuls les admins peuvent écrire." }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: "❌ Échec. Vérifie que le bot est admin." }, { quoted: m });
    }
};
