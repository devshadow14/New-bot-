const fs = require("fs");
const path = require("path");

const commands = {};
const commandsPath = path.join(__dirname, "..", "commands");

function loadCommands() {

    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        console.log("⚠️ commands folder created.");
        return commands;
    }

    const files = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of files) {

        const commandName = path.basename(file, ".js").toLowerCase();
        const filePath = path.join(commandsPath, file);

        try {
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            if (typeof command !== "function") {
                console.error(`❌ Command ${file} does not export a function.`);
                continue;
            }

            commands[commandName] = command;

        } catch (error) {
            console.error(`\n❌ Failed to load command: ${file}`);
            console.error(`➡️ Error: ${error.message}`);
        }
    }

    console.log(`📦 Commands loaded successfully: ${Object.keys(commands).length}\n`);
    return commands;
}

module.exports = { commands, loadCommands };
