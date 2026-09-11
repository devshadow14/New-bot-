const { getAnticall, setAnticall } = require("../lib/instanceSettings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const isOwner = m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Seul le propriétaire de CETTE session peut utiliser cette commande." }, { quoted: m });
    }

    const choice = (args[0] || "").toLowerCase();
    if (choice !== "on" && choice !== "off") {
        return await sock.sendMessage(from, {
            text: `❌ *Usage:* \`.anticall on\` ou \`.anticall off\`\n📌 *État actuel:* ${getAnticall(sock) ? "Activé ✅" : "Désactivé ❌"}`
        }, { quoted: m });
    }

    setAnticall(sock, choice === "on");

    await sock.sendMessage(from, {
        text: `╭━━━〔 📵 *ANTICALL* 〕━━━⬣\n┃ ${choice === "on" ? "Activé ✅" : "Désactivé ❌"}\n┃ (cette session uniquement)\n╰━━━━━━━━━━━━━━━━━━━━⬣`
    }, { quoted: m });
};
