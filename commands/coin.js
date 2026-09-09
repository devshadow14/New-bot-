module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const result = Math.random() < 0.5 ? "🪙 Face" : "🪙 Pile";
    await sock.sendMessage(from, { text: `*Résultat:* ${result} !` }, { quoted: m });
};
