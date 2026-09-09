const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé au propriétaire." }, { quoted: m });
    }

    if (args[0] !== "confirm") {
        return await sock.sendMessage(from, {
            text:
                `⚠️ *ATTENTION:* Cette commande déconnecte complètement le bot de WhatsApp (comme un déliage manuel).\n\n` +
                `Pour confirmer, tape :\n\`.deleteme confirm\``
        }, { quoted: m });
    }

    try {
        await sock.sendMessage(from, { text: "👋 Déconnexion du bot en cours... À bientôt !" });
        await sock.logout();
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
