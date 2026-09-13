const { fetchAnimeGif } = require("../lib/animeGif");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const target = quoted?.mentionedJid?.[0] || quoted?.participant;

    try {
        const url = await fetchAnimeGif('bored', None);

        let caption = "😑 *BORED*";
        let mentions = [];
        if (target) {
            caption = `😑 @${sender.split("@")[0]} s'ennuie avec @${target.split("@")[0]}`;
            mentions = [sender, target];
        }

        await sock.sendMessage(from, {
            video: { url },
            gifPlayback: true,
            caption,
            mentions
        }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ API indisponible pour .bored: ${error.message}` }, { quoted: m });
    }
};
