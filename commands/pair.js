module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    const number = (args[0] || "").replace(/[^0-9]/g, "");
    if (!number || number.length < 8) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.pair 221xxxxxxxxx`" }, { quoted: m });
    }

    await sock.sendMessage(from, { text: "⏳ Génération du code en cours..." }, { quoted: m });

    try {
        const { requestPairingForNumber } = require("../pairing-api");
        const result = await requestPairingForNumber(number);

        if (result.alreadyConnected) {
            return await sock.sendMessage(from, {
                text: "╭━━━〔 ✅ *PAIR* 〕━━━⬣\n┃ Ce numéro est déjà connecté.\n╰━━━━━━━━━━━━━━━━━━━━⬣"
            }, { quoted: m });
        }

        await sock.sendMessage(from, {
            text: `╭━━━〔 ✅ *CODE DE PAIRING* 〕━━━⬣\n┃ \`${result.pairingCode}\`\n┃\n┃ WhatsApp > Appareils liés\n┃ > Lier avec un numéro\n╰━━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
