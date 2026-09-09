const MESSAGES = [
    "😄 Journée parfaite, rien ne peut gâcher ma bonne humeur !",
    "🥳 Trop content là, tout va bien dans le meilleur des mondes !",
    "😁 Sourire jusqu'aux oreilles, la vie est belle."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    await sock.sendMessage(from, { text }, { quoted: m });
};
