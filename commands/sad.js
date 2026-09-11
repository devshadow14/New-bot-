const MESSAGES = [
    "Journée un peu difficile aujourd'hui...",
    "Pas la forme, besoin d'un câlin virtuel.",
    "Petit coup de blues passager."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    await sock.sendMessage(from, {
        text: `╭━━━〔 😢 *SAD* 〕━━━⬣\n┃ ${text}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
    }, { quoted: m });
};
