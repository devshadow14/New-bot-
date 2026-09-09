const MESSAGES = [
    "❤️ Plein d'amour à envoyer aujourd'hui !",
    "💕 Mon cœur déborde de tendresse.",
    "💘 Cupidon est passé par ici."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    await sock.sendMessage(from, { text }, { quoted: m });
};
