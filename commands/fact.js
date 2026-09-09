const FACTS = [
    "Le miel ne se périme jamais s'il est bien conservé — on a retrouvé du miel comestible dans des tombes égyptiennes vieilles de 3000 ans.",
    "Un jour sur Vénus est plus long qu'une année sur Vénus.",
    "Les poulpes ont trois cœurs et du sang bleu.",
    "Le cœur d'une crevette se trouve dans sa tête.",
    "Il pleut des diamants sur Jupiter et Saturne.",
    "Les bananes sont légèrement radioactives à cause de leur teneur en potassium.",
    "Un groupe de flamants roses s'appelle une 'flamboyance'.",
    "L'ADN humain est identique à 60% à celui d'une banane."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
    await sock.sendMessage(from, { text: `🧠 *LE SAVAIS-TU ?*\n\n${fact}` }, { quoted: m });
};
