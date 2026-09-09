const ANSWERS = [
    "Oui, absolument.", "C'est certain.", "Sans aucun doute.", "Probablement oui.",
    "Les signes indiquent que oui.", "Réponse floue, redemande plus tard.",
    "Ne compte pas dessus.", "Ma réponse est non.", "Les perspectives ne sont pas bonnes.",
    "Très douteux.", "Impossible à prédire pour le moment.", "Concentre-toi et redemande."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const question = args.join(" ");

    if (!question) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.8ball Ta question ?`" }, { quoted: m });
    }

    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    await sock.sendMessage(from, {
        text: `🎱 *Boule Magique*\n\n❓ ${question}\n🔮 ${answer}`
    }, { quoted: m });
};
