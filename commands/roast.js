const ROASTS = [
    "es tellement lent(e) que même le chargement WhatsApp va plus vite que toi.",
    "as un humour tellement nul que même l'emoji 😐 rigole pas.",
    "parles tellement que même Siri a raccroché.",
    "es célèbre... dans la liste des gens à mute 😂",
    "as un niveau de swag proche de zéro absolu.",
    "es tellement en retard que même le bus t'a laissé tomber."
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const target = quoted?.mentionedJid?.[0] || quoted?.participant || (m.key.participant || m.key.remoteJid);

    const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];

    await sock.sendMessage(from, {
        text: `🔥 @${target.split("@")[0]} tu ${roast}\n\n_(pour rire uniquement 😄)_`,
        mentions: [target]
    }, { quoted: m });
};
