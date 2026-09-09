module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const target = args[0] || "toi";

    await sock.sendMessage(from, { text: "💣 Amorçage..." }, { quoted: m });
    await new Promise(r => setTimeout(r, 700));
    await sock.sendMessage(from, { text: "💣 3..." });
    await new Promise(r => setTimeout(r, 500));
    await sock.sendMessage(from, { text: "💣 2..." });
    await new Promise(r => setTimeout(r, 500));
    await sock.sendMessage(from, { text: "💣 1..." });
    await new Promise(r => setTimeout(r, 500));
    await sock.sendMessage(from, { text: `💥💥💥 BOOM sur ${target} ! 💥💥💥` });
};
