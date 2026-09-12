function getMoonPhase() {
    const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime();
    const lunarCycle = 29.53058867;
    const now = Date.now();
    const daysSince = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
    const phase = (daysSince % lunarCycle) / lunarCycle;

    const phases = [
        { name: "🌑 Nouvelle Lune", max: 0.03 },
        { name: "🌒 Premier Croissant", max: 0.22 },
        { name: "🌓 Premier Quartier", max: 0.28 },
        { name: "🌔 Lune Gibbeuse Croissante", max: 0.47 },
        { name: "🌕 Pleine Lune", max: 0.53 },
        { name: "🌖 Lune Gibbeuse Décroissante", max: 0.72 },
        { name: "🌗 Dernier Quartier", max: 0.78 },
        { name: "🌘 Dernier Croissant", max: 0.97 },
        { name: "🌑 Nouvelle Lune", max: 1.01 }
    ];

    const found = phases.find(p => phase <= p.max);
    return { name: found.name, percent: Math.round(phase * 100) };
}

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const { name, percent } = getMoonPhase();

    const text =
        `╭━━━〔 🌙 *PHASE DE LUNE* 〕━━━⬣\n` +
        `┃ ${name}\n` +
        `┃ 📊 Cycle: ${percent}%\n` +
        `┃ 📅 ${new Date().toLocaleDateString("fr-FR")}\n` +
        `╰━━━━━━━━━━━━━━━━━━━━⬣`;

    await sock.sendMessage(from, { text }, { quoted: m });
};
