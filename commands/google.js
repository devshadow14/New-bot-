module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const query = args.join(" ");

    if (!query) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.google chat GPT c'est quoi`" }, { quoted: m });
    }

    // Pas de scraping (contraire aux CGU de Google) : on génère juste le lien direct.
    const link = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    await sock.sendMessage(from, {
        text: `╭━━━〔 🔍 *GOOGLE* 〕━━━⬣\n┃ ${query}\n┃\n┃ 🔗 ${link}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
    }, { quoted: m });
};
