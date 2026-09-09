const QUOTES = [
    "\"La vie, c'est ce qui arrive pendant que tu es occupé à faire d'autres projets.\" — John Lennon",
    "\"Le succès, c'est tomber sept fois et se relever huit.\" — Proverbe japonais",
    "\"Ce qui ne nous tue pas nous rend plus fort.\" — Nietzsche",
    "\"La meilleure façon de prédire l'avenir, c'est de le créer.\" — Peter Drucker",
    "\"Fais de chaque jour ton chef-d'œuvre.\" — John Wooden",
    "\"L'échec est la condition de la réussite.\" — Winston Churchill"
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    await sock.sendMessage(from, { text: `💬 *CITATION*\n\n${quote}` }, { quoted: m });
};
