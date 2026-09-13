const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const query = args.join(" ");

    if (!query) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.gemini explique-moi la photosynthèse`" }, { quoted: m });
    }

    try {
        await sock.sendMessage(from, { react: { text: "🤖", key: m.key } });

        const apis = [
            `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
            `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
            `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
            `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
            `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
            `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`
        ];

        for (const api of apis) {
            try {
                const response = await fetch(api);
                const data = await response.json();
                const answer = data.message || data.data || data.answer || data.result;

                if (answer) {
                    await sock.sendMessage(from, {
                        text: `╭━━━〔 ✨ *GEMINI* 〕━━━⬣\n┃ ${answer}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
                    }, { quoted: m });
                    return;
                }
            } catch (e) {
                continue;
            }
        }

        throw new Error("Toutes les API Gemini ont échoué");

    } catch (error) {
        await sock.sendMessage(from, { text: "❌ Échec de la réponse IA. Réessaie plus tard." }, { quoted: m });
    }
};
