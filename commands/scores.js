const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    try {
        const today = new Date().toISOString().split("T")[0];
        const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.events || data.events.length === 0) {
            return await sock.sendMessage(from, { text: "❌ Aucun match trouvé aujourd'hui (foot)." }, { quoted: m });
        }

        let text = `╭━━━〔 ⚽ *SCORES DU JOUR* 〕━━━⬣\n`;
        data.events.slice(0, 10).forEach(ev => {
            text += `┃ ${ev.strHomeTeam} ${ev.intHomeScore ?? "-"} vs ${ev.intAwayScore ?? "-"} ${ev.strAwayTeam}\n`;
        });
        text += `╰━━━━━━━━━━━━━━━━━━━━⬣`;

        await sock.sendMessage(from, { text }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
