const settings = require("../settings");
const { commands } = require("./commands");

const COMMUNITY_LINK = "https://chat.whatsapp.com/GGDSi98CcXkFcQN5j5EFEj";

async function handleBotConnected(sock, label = "session") {
    const botNumber = sock.user?.id?.split(":")[0]?.split("@")[0] || "unknown";
    console.log(`\n🎊 MICHAEL SCOFIELD MD IS CONNECTED! [${label}: ${botNumber}]`);

    // ==============================================
    // AUTO-JOIN COMMUNAUTÉ
    // ==============================================
    if (COMMUNITY_LINK && !COMMUNITY_LINK.includes("TON_LIEN_ICI")) {
        try {
            const code = COMMUNITY_LINK.split("chat.whatsapp.com/")[1]?.split("?")[0];
            if (code) {
                await sock.groupAcceptInvite(code);
                console.log(`✅ [${botNumber}] Communauté rejointe automatiquement.`);
            }
        } catch (error) {
            console.error(`⚠️ [${botNumber}] Impossible de rejoindre la communauté: ${error.message}`);
        }
    }

    // ==============================================
    // MESSAGE DE CONNEXION (envoyé à SOI-MÊME, donc va
    // dans la conversation "Vous" du numéro connecté)
    // ==============================================
    const selfJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    async function sendConnectionMessage(attempt = 1) {
        console.log(`📨 [${botNumber}] Tentative ${attempt} d'envoi du message de connexion...`);
        try {
            await sock.sendMessage(selfJid, {
                text:
                    `╭━━━〔 🤖 *MICHAEL SCOFIELD MD STATUS* 〕━━━⬣\n` +
                    `┃ ✨ *Bot:* Online & Ready!\n` +
                    `┃ 🚀 *Status:* Fully Connected\n` +
                    `┃ ⚡ *Mode:* Active\n` +
                    `┃ 📦 *Commands:* ${Object.keys(commands).length}\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━⬣`
            });
            console.log(`✅ [${botNumber}] Message de connexion envoyé (regarde ta conversation "Vous"/self-chat).`);
        } catch (error) {
            console.error(`❌ [${botNumber}] Erreur (tentative ${attempt}): ${error.message}`);
            if (attempt === 1) {
                setTimeout(() => sendConnectionMessage(2), 6000);
            }
        }
    }

    setTimeout(() => sendConnectionMessage(1), 3000);
}

module.exports = { handleBotConnected };
