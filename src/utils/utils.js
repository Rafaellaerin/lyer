const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

/**
 * Load bot commands
 * @param {Client} client - Discord bot instance
 * @returns {Array} - List of commands formatted for registration
 */
function loadCommands(client) {
  const commands = [];
  const commandsPath = path.join(__dirname, '../commands'); // Correct path to the commands directory

  // Check if the directory exists
  if (!fs.existsSync(commandsPath)) {
    console.error(`❌ The commands directory was not found: ${commandsPath}`);
    process.exit(1); // Terminate the process if the directory does not exist
  }

  // Read all files in the commands folder
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    // Verify that the command exports the required properties
    if (!command.data || !command.data.name || !command.execute) {
      console.warn(`⚠️ The file ${file} does not export a valid command structure.`);
      continue; // Skip files with invalid structure
    }

    // Add command to the client's commands collection
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON()); // Format command for registration
  }

  return commands;
}

/**
 * Register commands on Discord
 * @param {Array} commands - List of commands to be registered
 */
async function registerCommands(commands) {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN); // Initialize REST client

  try {
    console.log('// Registering commands on Discord...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // Register commands for a specific guild
      { body: commands }
    );
    console.log('// Commands successfully registered!');
  } catch (error) {
    console.error('// Error registering commands:', error);
  }
}

module.exports = { loadCommands, registerCommands };
