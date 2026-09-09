module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    await sock.sendMessage(from, {
        text: "💥 *BOOM* 💥\n\n```\n   \\   |   /\n    \\  |  /\n  ----BOOM----\n    /  |  \\\n   /   |   \\\n```"
    }, { quoted: m });
};
