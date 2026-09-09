module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const mentioned = quoted?.mentionedJid || [];
    const sender = m.key.participant || m.key.remoteJid;

    let personA, personB;

    if (mentioned.length >= 2) {
        personA = mentioned[0];
        personB = mentioned[1];
    } else if (mentioned.length === 1) {
        personA = sender;
        personB = mentioned[0];
    } else {
        return await sock.sendMessage(from, {
            text: "❌ *Usage:* `.ship @personne1 @personne2` (ou juste `.ship @personne`)"
        }, { quoted: m });
    }

    const percent = Math.floor(Math.random() * 101);
    let bar = "";
    const filled = Math.round(percent / 10);
    for (let i = 0; i < 10; i++) bar += i < filled ? "💖" : "🤍";

    let comment;
    if (percent >= 80) comment = "C'est le grand amour ! 💍";
    else if (percent >= 50) comment = "Y'a du potentiel ! 😏";
    else if (percent >= 20) comment = "Bof bof, juste amis peut-être...";
    else comment = "Aucune chance, désolé 😅";

    await sock.sendMessage(from, {
        text: `💘 *SHIP METER*\n\n@${personA.split("@")[0]} 💕 @${personB.split("@")[0]}\n\n${bar}\n*${percent}%*\n\n${comment}`,
        mentions: [personA, personB]
    }, { quoted: m });
};
