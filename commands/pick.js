module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const input = args.join(" ");

    if (!input || !input.includes(",")) {
        return await sock.sendMessage(from, {
            text: "❌ *Usage:* `.pick pizza, burger, sushi`"
        }, { quoted: m });
    }

    const options = input.split(",").map(o => o.trim()).filter(Boolean);
    if (options.length < 2) {
        return await sock.sendMessage(from, { text: "❌ Donne au moins 2 options séparées par des virgules." }, { quoted: m });
    }

    const choice = options[Math.floor(Math.random() * options.length)];
    await sock.sendMessage(from, { text: `🎯 *Je choisis:* ${choice}` }, { quoted: m });
};
