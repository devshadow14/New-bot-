const RIDDLES = [
    { q: "Plus je sèche, plus je deviens mouillé. Que suis-je ?", a: "Une serviette" },
    { q: "J'ai des villes mais pas de maisons, des forêts mais pas d'arbres, des rivières mais pas d'eau. Que suis-je ?", a: "Une carte" },
    { q: "Qu'est-ce qui a des dents mais ne peut pas mordre ?", a: "Un peigne" },
    { q: "Plus tu en prends, plus tu en laisses derrière toi. Que suis-je ?", a: "Des pas" },
    { q: "Je vole sans ailes, je pleure sans yeux. Que suis-je ?", a: "Un nuage" },
    { q: "Qu'est-ce qui monte mais ne redescend jamais ?", a: "L'âge" },
    { q: "Plus on m'enlève, plus je deviens grand. Que suis-je ?", a: "Un trou" },
    { q: "Je n'ai pas de vie mais je peux mourir. Que suis-je ?", a: "Une pile / batterie" }
];

const INVISIBLE_CHAR = "\u200E".repeat(4001);

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];

    const text =
        `🧩 *ÉNIGME*\n\n${riddle.q}` +
        INVISIBLE_CHAR +
        `\n\n💡 *Réponse:* ${riddle.a}`;

    await sock.sendMessage(from, { text }, { quoted: m });
};
