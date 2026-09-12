const MAPS = [
    { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ғ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" },
    { a: "ค", b: "๖", c: "ς", d: "๔", e: "є", f: "Ŧ", g: "ﻮ", h: "ђ", i: "เ", j: "ן", k: "k", l: "ɭ", m: "๓", n: "ภ", o: "๏", p: "р", q: "ợ", r: "r", s: "ร", t: "t", u: "ย", v: "ש", w: "ฬ", x: "x", y: "ץ", z: "z" },
    { a: "ᗩ", b: "ᗷ", c: "ᑕ", d: "ᗪ", e: "E", f: "ᖴ", g: "G", h: "ᕼ", i: "I", j: "ᒍ", k: "K", l: "ᒪ", m: "ᗰ", n: "ᑎ", o: "O", p: "ᑭ", q: "ᑫ", r: "ᖇ", s: "ᔕ", t: "T", u: "ᑌ", v: "ᐯ", w: "ᗯ", x: "᙭", y: "Y", z: "ᘔ" }
];

module.exports = async (sock, m, args) => {
    const from = m.key.remoteJid;
    const input = args.join(" ");

    if (!input) {
        return await sock.sendMessage(from, { text: "❌ *Usage:* `.fancy <texte>`" }, { quoted: m });
    }

    let text = `╭━━━〔 ✨ *FANCY TEXT* 〕━━━⬣\n`;
    MAPS.forEach((map, i) => {
        const styled = Array.from(input.toLowerCase()).map(c => map[c] || c).join("");
        text += `┃ ${i + 1}. ${styled}\n`;
    });
    text += `╰━━━━━━━━━━━━━━━━━━━━⬣`;

    await sock.sendMessage(from, { text }, { quoted: m });
};
