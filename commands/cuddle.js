const { fetchAnimeGif } = require("../lib/animeGif");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const target = quoted?.mentionedJid?.[0] || quoted?.participant;

    try {
        const url = await fetchAnimeGif('cuddle', 'cuddle');

        let caption = "🥰 *CUDDLE*";
        let mentions = [];
        if (target) {
            caption = `🥰 @${sender.split("@")[0]} se blottit contre @${target.split("@")[0]}`;
            mentions = [sender, target];
        }

        await sock.sendMessage(from, {
            video: { url },
            gifPlayback: true,
            caption,
            mentions
        }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ API indisponible pour .cuddle: ${error.message}` }, { quoted: m });
    }
};
