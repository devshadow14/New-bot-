const { readDb, writeDb } = require("./db");
const settings = require("../settings");

function getBotId(sock) {
    return sock.user?.id?.split(":")[0]?.split("@")[0] || "unknown";
}

function getInstance(db, botId) {
    if (!db.instances) db.instances = {};
    if (!db.instances[botId]) db.instances[botId] = {};
    return db.instances[botId];
}

function getPrefix(sock) {
    const db = readDb();
    const instance = getInstance(db, getBotId(sock));
    return instance.prefix || settings.prefix || ".";
}

function setPrefix(sock, value) {
    const db = readDb();
    const instance = getInstance(db, getBotId(sock));
    instance.prefix = value;
    writeDb(db);
}

function getMode(sock) {
    const db = readDb();
    const instance = getInstance(db, getBotId(sock));
    return instance.mode || "public";
}

function setMode(sock, value) {
    const db = readDb();
    const instance = getInstance(db, getBotId(sock));
    instance.mode = value;
    writeDb(db);
}

function getAnticall(sock) {
    const db = readDb();
    const instance = getInstance(db, getBotId(sock));
    return !!instance.anticall;
}

function setAnticall(sock, value) {
    const db = readDb();
    const instance = getInstance(db, getBotId(sock));
    instance.anticall = value;
    writeDb(db);
}

module.exports = { getBotId, getPrefix, setPrefix, getMode, setMode, getAnticall, setAnticall };
