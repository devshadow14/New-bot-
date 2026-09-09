const settings = require("../settings");

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const ownerNumber = settings.ownerNumber.replace(/[^0-9]/g, "");
    const isOwner = sender.includes(ownerNumber) || m.key.fromMe;

    if (!isOwner) {
        return await sock.sendMessage(from, { text: "❌ *Access Denied:* Réservé au propriétaire." }, { quoted: m });
    }

    const message = args.join(" ");
    if (!message) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.bc Ton message ici`" }, { quoted: m });
    }

    try {
        const groups = await sock.groupFetchAllParticipating();
        const groupIds = Object.keys(groups);

        await sock.sendMessage(from, { text: `📢 Diffusion en cours vers ${groupIds.length} groupes...` }, { quoted: m });

        let sent = 0;
        for (const gid of groupIds) {
            try {
                await sock.sendMessage(gid, {
                    text: `📢 *ANNONCE*\n\n${message}\n\n_— ${settings.botName}_`
                });
                sent++;
                await new Promise(r => setTimeout(r, 800)); // évite le rate-limit
            } catch (e) {
                console.error(`Broadcast error for ${gid}: ${e.message}`);
            }
        }

        await sock.sendMessage(from, { text: `✅ Message envoyé à ${sent}/${groupIds.length} groupes.` });

    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Erreur: ${error.message}` }, { quoted: m });
    }
};
