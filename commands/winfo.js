module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;

    if (!args[0]) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.winfo 221xxxxxxxxx`" }, { quoted: m });
    }

    const number = args[0].replace(/[^0-9]/g, "");

    try {
        const [result] = await sock.onWhatsApp(number + "@s.whatsapp.net");

        if (!result?.exists) {
            return await sock.sendMessage(from, { text: "❌ Ce numéro n'est pas sur WhatsApp." }, { quoted: m });
        }

        let text = `╭━━━〔 📱 *WINFO* 〕━━━⬣\n┃ 🆔 JID: ${result.jid}\n┃ ✅ Existe: Oui\n`;
        if (result.isBusiness) text += `┃ 🏢 Business: Oui\n`;
        text += `╰━━━━━━━━━━━━━━━━━━━━⬣`;

        await sock.sendMessage(from, { text }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
