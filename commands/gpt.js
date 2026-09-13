const fetch = require("node-fetch");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const query = args.join(" ");

    if (!query) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.gpt write a basic html code`" }, { quoted: m });
    }

    try {
        await sock.sendMessage(from, { react: { text: "🤖", key: m.key } });

        const response = await fetch(`https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data?.status && data?.result) {
            await sock.sendMessage(from, {
                text: `╭━━━〔 🤖 *GPT* 〕━━━⬣\n┃ ${data.result}\n╰━━━━━━━━━━━━━━━━━━━━⬣`
            }, { quoted: m });
        } else {
            throw new Error("Réponse invalide de l'API");
        }

    } catch (error) {
        await sock.sendMessage(from, { text: "❌ Échec de la réponse IA. Réessaie plus tard." }, { quoted: m });
    }
};
