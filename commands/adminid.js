module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!from.endsWith("@g.us")) {
        return await sock.sendMessage(from, { text: "❌ Cette commande ne marche qu'en groupe." }, { quoted: m });
    }

    try {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin !== null);

        if (admins.length === 0) {
            return await sock.sendMessage(from, { text: "❌ Aucun admin trouvé." }, { quoted: m });
        }

        let text = `╭━━━〔 👑 *ADMIN ID* 〕━━━⬣\n`;
        admins.forEach(a => {
            text += `┃ • @${a.id.split("@")[0]} (\`${a.id}\`)\n`;
        });
        text += `╰━━━━━━━━━━━━━━━━━━━━⬣`;

        await sock.sendMessage(from, { text, mentions: admins.map(a => a.id) }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
