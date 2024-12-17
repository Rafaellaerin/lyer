const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { loadLog, saveLog } = require('../utils/logDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogbanned')
    .setDescription('Sets the channel for ban logs.')
    .addChannelOption((option) =>
      option.setName('channel').setDescription('The channel for ban logs').setRequired(true)
    ),
  async execute(interaction) {
    // Verify if the user has Administrator permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'You cannot use this command, silly!',
        ephemeral: true,
      });
    }

    // Whitelist of roles/servers (optional)
    const allowedRoles = ['role1', 'role2', 'role3']; // Here you can put the names of the positions of what you are asking for, as I am Brazilian and don't know English and I'm too lazy to see which command this is, you can turn to find out what it works for. Well, in short, place the supreme positions.
    const hasAllowedRole = interaction.member.roles.cache.some((role) =>
      allowedRoles.includes(role.name)
    );

    if (!hasAllowedRole) {
      return interaction.reply({
        content: '❌ You do not have the required privileges to use this command.',
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel('channel');
    if (!channel.isTextBased()) {
      return interaction.reply({
        content: '❌ Please select a valid text channel!',
        ephemeral: true,
      });
    }

    // Logs the activity for auditing purposes
    console.log(
      `[Command Log] ${interaction.user.tag} used the /setlogbanned command in ${interaction.guild.name}`
    );

    // Set the channel for ban logs
    try {
      const logData = loadLog('banned');
      logData.logChannelId = channel.id;
      saveLog('banned', logData);

      await interaction.reply({
        content: `✅ Ban log channel set to: ${channel}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[Error] Could not save log data: ${error}`);
      interaction.reply({
        content: '❌ An error occurred while trying to save the configuration. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
