module.exports = async (sock, m) => {
    try {
        const { remoteJid } = m.key;

        const aliveTemplate = `╭━━━〔 *MICHAEL SCOFIELD-MD* 〕━━━⬣
┃ 🛰️ *Status:* \`Online & Stable\`
┃ ⚙️ *Version:* \`2.0.0\`
┃ 💎 *Platform:* \`Pterodactyl / Cloud\`
╰━━━━━━━━━━━━━━━━━━━━⬣

> *DEV MICHAEL SCOFIELD Md is fully operational and ready to serve.* 💜`.trim();

        // Send the image along with the text as caption and channel info
        await sock.sendMessage(remoteJid, { 
            image: { url: "https://files.catbox.moe/njjlos.jpg" }, // Change image link if needed
            caption: aliveTemplate,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "@newsletter",
                    newsletterName: "MICHAEL SCOFIELD-MD OFFICIAL",
                    serverMessageId: 100
                }
            }
        }, { quoted: m });

        // Send the voice note (PTT) afterwards
        await sock.sendMessage(remoteJid, { 
            audio: { url: "https://files.catbox.moe/pframr.mp3" }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        }, { quoted: m });

    } catch (error) {
        console.error("Error in alive command:", error);
    }
};
