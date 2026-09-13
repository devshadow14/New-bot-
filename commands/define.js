const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const word = args.join(" ");

    if (!word) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.define hello` (mots anglais uniquement)" }, { quoted: m });
    }

    try {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
        const res = await fetch(url);

        if (!res.ok) {
            return await sock.sendMessage(from, { text: "❌ Mot introuvable dans le dictionnaire." }, { quoted: m });
        }

        const data = await res.json();
        const entry = data[0];
        const meaning = entry.meanings[0];
        const def = meaning.definitions[0];

        let text =
            `╭━━━〔 📚 *DÉFINITION* 〕━━━⬣\n` +
            `┃ *${entry.word}* (${meaning.partOfSpeech})\n┃\n` +
            `┃ ${def.definition}\n`;
        if (def.example) text += `┃ 💬 _"${def.example}"_\n`;
        text += `╰━━━━━━━━━━━━━━━━━━━━⬣`;

        await sock.sendMessage(from, { text }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
