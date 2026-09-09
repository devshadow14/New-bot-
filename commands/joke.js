const JOKES = [
    "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau !",
    "C'est un fantôme qui rentre dans un bar... il traverse le mur, en fait.",
    "Qu'est-ce qui est jaune et qui attend ? Jonathan.",
    "Pourquoi les poissons détestent l'ordinateur ? À cause du hameçon.",
    "Un electron rentre dans un bar, le barman lui demande : 'Ça va ?' L'électron répond : 'Non, j'ai perdu mon atome.'",
    "Deux antennes se marient. La cérémonie n'était pas terrible, mais la réception excellente.",
    "Pourquoi les développeurs préfèrent le noir ? Parce que la lumière attire les bugs.",
    "Qu'est-ce qu'un crocodile qui surveille la Bourse ? Un investigator."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
    await sock.sendMessage(from, { text: `😂 *BLAGUE*\n\n${joke}` }, { quoted: m });
};
