const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé au propriétaire." }, { quoted: m });
    }

    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = quoted?.quotedMessage;

    if (!quotedMsg || !args[0]) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* Cite un message + `.forward 221xxxxxxxxx`" }, { quoted: m });
    }

    const targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    try {
        await sock.sendMessage(targetJid, { forward: { key: quoted.stanzaId ? { remoteJid: from, id: quoted.stanzaId, participant: quoted.participant } : m.key, message: quotedMsg } });
        await sock.sendMessage(from, {
            text: "╭━━━〔 ✅ *FORWARD* 〕━━━⬣\n┃ Message transféré.\n╰━━━━━━━━━━━━━━━━━━━━⬣"
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
