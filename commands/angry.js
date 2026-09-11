const MESSAGES = [
    "Grrr... quelqu'un a réveillé le côté sombre !",
    "STOP ! Tu commences à m'énerver sérieusement.",
    "Je bous de rage intérieurement là."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    await sock.sendMessage(from, {
        text: `╭━━━〔 😠 *ANGRY* 〕━━━⬣\n┃ ${text}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
    }, { quoted: m });
};
