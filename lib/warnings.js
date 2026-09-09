const { readDb, writeDb, getGroupConfig } = require("./db");

const MAX_WARNINGS = 3;

/**
 * Ajoute un avertissement à un utilisateur dans un groupe.
 * Retourne { count, kicked }.
 */
function addWarning(chatId, userId) {
    const db = readDb();
    const group = getGroupConfig(db, chatId);
    if (!group.warnings) group.warnings = {};

    group.warnings[userId] = (group.warnings[userId] || 0) + 1;
    const count = group.warnings[userId];
    const kicked = count >= MAX_WARNINGS;

    if (kicked) {
        group.warnings[userId] = 0; // reset après expulsion
    }

    writeDb(db);
    return { count, kicked };
}

function resetWarning(chatId, userId) {
    const db = readDb();
    const group = getGroupConfig(db, chatId);
    if (!group.warnings) group.warnings = {};

    if (userId) {
        group.warnings[userId] = 0;
    } else {
        group.warnings = {};
    }
    writeDb(db);
}

function getWarnings(chatId) {
    const db = readDb();
    const group = getGroupConfig(db, chatId);
    return group.warnings || {};
}

module.exports = { addWarning, resetWarning, getWarnings, MAX_WARNINGS };
