module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sides = parseInt(args[0]) || 6;
    const result = Math.floor(Math.random() * sides) + 1;
    await sock.sendMessage(from, { text: `🎲 *Dé à ${sides} faces:* ${result}` }, { quoted: m });
};
