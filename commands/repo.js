module.exports = async (sock, m, args) => {
    const repoText = `╭━━━〔 🤖 *MICHEAL SCOFIELD-MD REPOSITORY* 〕━━━⬣
┃ 🤖 *Bot Name:* MICHAEL SCOFIELD MD 
┃ 👑 *Owner:* papino🌹
┃ 📦 *GitHub:* https:XXXXX
╰━━━━━━━━━━━━━━━━━━━━⬣`;

    const channelInfo = {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '@newsletter',
                newsletterName: 'MICHAEL SCOFIELD-MD',
                serverMessageId: -1
            }
        }
    };

    await sock.sendMessage(m.key.remoteJid, {
        image: { url: "https://files.catbox.moe/njjlos.jpg" },
        caption: repoText,
        ...channelInfo
    }, { quoted: m });
};
