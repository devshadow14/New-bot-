const MESSAGES = [
    "Euh... je ne sais pas où me mettre là.",
    "Arrête, tu me gênes !",
    "*rougit et regarde ailleurs*"
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    await sock.sendMessage(from, {
        text: `╭━━━〔 🙈 *SHY* 〕━━━⬣\n┃ ${text}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
    }, { quoted: m });
};
