module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const thing = args.join(" ");

    if (!thing) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.rate la pizza`" }, { quoted: m });
    }

    const score = Math.floor(Math.random() * 11);
    const stars = "⭐".repeat(score) + "☆".repeat(10 - score);

    await sock.sendMessage(from, {
        text: `📊 *${thing}*\n\n${stars}\n*Note:* ${score}/10`
    }, { quoted: m });
};
