const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const input = args.join(" ");

    if (!input || !input.includes("-")) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.lyrics Artiste - Titre`" }, { quoted: m });
    }

    const [artist, title] = input.split("-").map(s => s.trim());

    try {
        const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.lyrics) {
            return await sock.sendMessage(from, { text: "❌ Paroles introuvables pour cette chanson." }, { quoted: m });
        }

        const lyrics = data.lyrics.slice(0, 3500);
        await sock.sendMessage(from, {
            text: `╭━━━〔 🎵 *${title.toUpperCase()}* 〕━━━⬣\n┃ ${artist}\n╰━━━━━━━━━━━━━━━━━━━━⬣\n\n${lyrics}`
        }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
