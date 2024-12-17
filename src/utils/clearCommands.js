const { REST, Routes } = require('discord.js');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

// Initialize the REST client with Discord API version 10
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

//
// Delete all registered commands
//
(async () => {
  try {
    console.log('// Deleting all registered commands...'); // Log start of process

    // Fetch all commands registered in the specified guild
    const commands = await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    );

    // Loop through all commands and delete them one by one
    for (const command of commands) {
      await rest.delete(
        Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id)
      );
      console.log(`// Command "${command.name}" deleted.`); // Log each command deleted
    }

    console.log('// All commands have been successfully deleted.'); // Log completion
  } catch (error) {
    console.error('// Error deleting commands:', error); // Log any errors
  }
})();
