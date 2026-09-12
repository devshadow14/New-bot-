const MESSAGES = [
    "Attends... je ne comprends plus rien là.",
    "Ma tête tourne, trop d'informations d'un coup.",
    "Quoi ? Répète, j'ai zappé."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    await sock.sendMessage(from, {
        text: `╭━━━〔 🤔 *CONFUSED* 〕━━━⬣\n┃ ${text}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
    }, { quoted: m });
};
