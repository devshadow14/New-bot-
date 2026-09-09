const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database.json");

function readDb() {
    let db = {};
    if (fs.existsSync(dbPath)) {
        try { db = JSON.parse(fs.readFileSync(dbPath, "utf8")); } catch {}
    }
    return db;
}

async function handleGroupParticipantsUpdate(sock, update) {
    try {
        const { id: chatId, participants, action } = update;
        const db = readDb();
        const groupConfig = db.groups?.[chatId] || {};

        let groupName = "ce groupe";
        try {
            const metadata = await sock.groupMetadata(chatId);
            groupName = metadata.subject;
        } catch {}

        for (const participant of participants) {
            if (action === "add") {

                // ANTIBOT (heuristique) : kick tout nouveau membre dont le nom affiché contient "bot"
                if (groupConfig.antibot) {
                    try {
                        const [info] = await sock.onWhatsApp(participant);
                        const pushName = info?.notify || "";
                        if (/bot/i.test(pushName)) {
                            await sock.groupParticipantsUpdate(chatId, [participant], "remove");
                            await sock.sendMessage(chatId, {
                                text: `🤖 *AntiBot:* @${participant.split("@")[0]} a été expulsé (détecté comme bot).`,
                                mentions: [participant]
                            });
                            continue;
                        }
                    } catch (e) {
                        console.error(`AntiBot check error: ${e.message}`);
                    }
                }

                if (groupConfig.welcome) {
                    await sock.sendMessage(chatId, {
                        text:
                            `👋 *Bienvenue !*\n\n` +
                            `@${participant.split("@")[0]}, bienvenue dans *${groupName}* !\n` +
                            `On espère que tu vas bien t'amuser ici 🎉`,
                        mentions: [participant]
                    });
                }

            } else if (action === "remove") {
                if (groupConfig.goodbye) {
                    await sock.sendMessage(chatId, {
                        text: `👋 *Au revoir* @${participant.split("@")[0]}, à bientôt peut-être !`,
                        mentions: [participant]
                    });
                }
            }
        }
    } catch (error) {
        console.error(`❌ GroupParticipantsUpdate Error: ${error.message}`);
    }
}

module.exports = { handleGroupParticipantsUpdate };
