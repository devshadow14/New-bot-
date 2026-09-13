const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const city = args.join(" ");

    if (!city) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.weather Dakar`" }, { quoted: m });
    }

    try {
        const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
        const res = await fetch(url);
        const data = await res.json();

        const current = data.current_condition[0];
        const area = data.nearest_area[0];

        const text =
            `╭━━━〔 🌤️ *MÉTÉO* 〕━━━⬣\n` +
            `┃ 📍 ${area.areaName[0].value}, ${area.country[0].value}\n` +
            `┃ 🌡️ ${current.temp_C}°C (ressenti ${current.FeelsLikeC}°C)\n` +
            `┃ ☁️ ${current.weatherDesc[0].value}\n` +
            `┃ 💧 Humidité: ${current.humidity}%\n` +
            `┃ 💨 Vent: ${current.windspeedKmph} km/h\n` +
            `╰━━━━━━━━━━━━━━━━━━━━⬣`;

        await sock.sendMessage(from, { text }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Ville introuvable ou erreur: ${error.message}` }, { quoted: m });
    }
};
