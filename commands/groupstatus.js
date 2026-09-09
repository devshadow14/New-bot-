module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    try {
        const metadata = await sock.groupMetadata(from);

        const text =
            `📊 *STATUT DU GROUPE*\n\n` +
            `📛 *Nom:* ${metadata.subject}\n` +
            `🔒 *Messages restreints aux admins:* ${metadata.announce ? "Oui ✅" : "Non ❌"}\n` +
            `✏️ *Modif. infos restreinte aux admins:* ${metadata.restrict ? "Oui ✅" : "Non ❌"}\n` +
            `👥 *Membres:* ${metadata.participants.length}`;

        await sock.sendMessage(from, { text }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
