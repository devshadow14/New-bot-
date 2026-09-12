module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const mentioned = quoted?.mentionedJid?.[0];
    const quotedParticipant = quoted?.participant;

    let target = mentioned || quotedParticipant;

    if (!target && args[0]) {
        target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    }
    if (!target) {
        target = m.key.participant || from;
    }

    try {
        const ppUrl = await sock.profilePictureUrl(target, "image");
        await sock.sendMessage(from, {
            image: { url: ppUrl },
            caption: `╭━━━〔 🖼️ *GETDP* 〕━━━⬣\n┃ @${target.split("@")[0]}\n╰━━━━━━━━━━━━━━━━━━━━⬣`,
            mentions: [target]
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: "❌ Impossible de récupérer la photo de profil (privée ou introuvable)." }, { quoted: m });
    }
};
