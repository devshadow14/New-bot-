module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo;

    if (!quoted?.stanzaId) {
        return await sock.sendMessage(from, {
            text: "❌ Cite le message que tu veux épingler avec `.pin`"
        }, { quoted: m });
    }

    try {
        await sock.sendMessage(from, {
            pin: {
                type: 1, // 1 = pin
                time: 86400, // 24h
                key: {
                    remoteJid: from,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                }
            }
        });
        await sock.sendMessage(from, { text: "📌 Message épinglé (24h)." }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
