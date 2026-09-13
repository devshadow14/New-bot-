module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const query = args.join(" ");

    if (!query) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.pinsearch décoration chambre`" }, { quoted: m });
    }

    const link = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

    await sock.sendMessage(from, {
        text: `╭━━━〔 📌 *PINTEREST* 〕━━━⬣\n┃ ${query}\n┃\n┃ 🔗 ${link}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
    }, { quoted: m });
};
