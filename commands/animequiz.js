const QUIZ = [
    { q: "Quel est le nom du protagoniste principal de 'Naruto' ?", options: ["Sasuke", "Naruto Uzumaki", "Kakashi", "Itachi"], answer: "Naruto Uzumaki" },
    { q: "Dans 'One Piece', quel est le rêve de Luffy ?", options: ["Devenir Hokage", "Devenir le Roi des Pirates", "Sauver le monde", "Devenir médecin"], answer: "Devenir le Roi des Pirates" },
    { q: "Quel est le nom du Death Note dans l'anime éponyme ?", options: ["Cahier de la Mort", "Death Note", "Livre Noir", "Carnet Maudit"], answer: "Death Note" },
    { q: "Dans 'Attack on Titan', comment s'appelle le personnage principal ?", options: ["Armin", "Eren Yeager", "Mikasa", "Levi"], answer: "Eren Yeager" },
    { q: "Quel est le nom de l'école dans 'My Hero Academia' ?", options: ["U.A. High School", "Konoha Academy", "Ouran Academy", "Shujin High"], answer: "U.A. High School" },
    { q: "Dans 'Demon Slayer', quelle arme utilise Tanjiro ?", options: ["Un fusil", "Un sabre Nichirin", "Un arc", "Une lance"], answer: "Un sabre Nichirin" }
];

const INVISIBLE_CHAR = "\u200E".repeat(4001);

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quiz = QUIZ[Math.floor(Math.random() * QUIZ.length)];

    const optionsText = quiz.options.map((o, i) => `${["A", "B", "C", "D"][i]}) ${o}`).join("\n");

    const text =
        `🎌 *ANIME QUIZ*\n\n${quiz.q}\n\n${optionsText}` +
        INVISIBLE_CHAR +
        `\n\n✅ *Réponse:* ${quiz.answer}`;

    await sock.sendMessage(from, { text }, { quoted: m });
};
