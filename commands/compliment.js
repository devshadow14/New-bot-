const COMPLIMENTS = [
    "est quelqu'un d'incroyable, sincèrement.",
    "a un sourire qui illumine la pièce.",
    "est bien plus intelligent(e) qu'il/elle ne le pense.",
    "mérite tout le bonheur du monde.",
    "a un cœur en or.",
    "est une personne sur qui on peut toujours compter.",
    "a un style unique, personne ne lui arrive à la cheville."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const target = quoted?.mentionedJid?.[0] || quoted?.participant || (m.key.participant || m.key.remoteJid);

    const compliment = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];

    await sock.sendMessage(from, {
        text: `✨ @${target.split("@")[0]} ${compliment}`,
        mentions: [target]
    }, { quoted: m });
};
