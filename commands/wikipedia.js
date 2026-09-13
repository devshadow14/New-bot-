const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const query = args.join(" ");

    if (!query) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.wikipedia Albert Einstein`" }, { quoted: m });
    }

    try {
        const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const res = await fetch(url);

        if (!res.ok) {
            return await sock.sendMessage(from, { text: "❌ Aucun article Wikipedia trouvé pour cette recherche." }, { quoted: m });
        }

        const data = await res.json();
        const extract = data.extract || "Pas de résumé disponible.";
        const pageUrl = data.content_urls?.desktop?.page || "";

        const text =
            `╭━━━〔 📖 *WIKIPEDIA* 〕━━━⬣\n` +
            `┃ *${data.title}*\n┃\n` +
            `┃ ${extract.slice(0, 500)}${extract.length > 500 ? "..." : ""}\n┃\n` +
            `┃ 🔗 ${pageUrl}\n` +
            `╰━━━━━━━━━━━━━━━━━━━━⬣`;

        if (data.thumbnail?.source) {
            await sock.sendMessage(from, { image: { url: data.thumbnail.source }, caption: text }, { quoted: m });
        } else {
            await sock.sendMessage(from, { text }, { quoted: m });
        }

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
