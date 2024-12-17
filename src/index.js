const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const { loadCommands, registerCommands } = require('./utils/utils');
const path = require('path');

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

// Create the bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // For Slash commands
    GatewayIntentBits.GuildMessages, // For server messages
    GatewayIntentBits.GuildMembers, // For member join/leave events
    GatewayIntentBits.MessageContent, // To read messages
    GatewayIntentBits.GuildMessageReactions, // For capturing reactions
    GatewayIntentBits.GuildVoiceStates, // For voice events
  ],
});

// Collection of commands
client.commands = new Collection();

//
// Load and register commands
//
(async () => {
  try {
    console.log('// Loading commands...'); // Logs the loading process
    const commands = loadCommands(client);

    console.log('// Registering commands on Discord...'); // Logs registration process
    await registerCommands(commands);

    console.log('// All commands successfully loaded and registered!'); // Success message
  } catch (error) {
    console.error('// Error while loading or registering commands:', error);
  }
})();

//
// Event: Bot Ready
//
client.once('ready', () => {
  console.log(`// Bot is online! Logged in as ${client.user.tag}`);
});

//
// Event: Interaction Create
//
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return; // Ignore non-command interactions

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.warn(`// Command not found: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction); // Execute the command
  } catch (error) {
    console.error(`// Error executing command ${interaction.commandName}:`, error);
    await interaction.reply({
      content: 'An error occurred while executing this command.',
      ephemeral: true,
    });
  }
});

//
// Register Automod and monitor messages
//
const automod = require('./commands/automod.js'); // Path to Automod system
client.once('ready', () => {
  automod.monitorMessages(client); // Start monitoring messages
});

//
// Start the bot
//
client.login(process.env.TOKEN).catch((err) => {
  console.error('// Error logging into Discord:', err);
});
