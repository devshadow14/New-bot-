module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    try {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin !== null).length;
        const createdDate = new Date(metadata.creation * 1000).toLocaleDateString("fr-FR");

        const text =
            `📋 *INFOS DU GROUPE*\n\n` +
            `📛 *Nom:* ${metadata.subject}\n` +
            `🆔 *ID:* ${metadata.id}\n` +
            `👥 *Membres:* ${metadata.participants.length}\n` +
            `👑 *Admins:* ${admins}\n` +
            `📅 *Créé le:* ${createdDate}\n` +
            `📝 *Description:* ${metadata.desc || "Aucune"}`;

        await sock.sendMessage(from, { text }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
