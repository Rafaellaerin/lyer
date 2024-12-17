const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { loadLog, saveLog } = require('../utils/logDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogunbanned')
    .setDescription('Sets the channel for unban logs.')
    .addChannelOption((option) =>
      option.setName('canal').setDescription('The channel for unban logs').setRequired(true)
    ),
  async execute(interaction) {
    // Checks if the user has administrative permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "You can't use that command, you idiot!",
        ephemeral: true,  
      });
    }

    // Whitelist of servers/positions (optional)
    const allowedRoles = ['role1', 'role2','role3']; // Here you can put the names of the positions of what you are asking for, as I am Brazilian and don't know English and I'm too lazy to see which command this is, you can turn to find out what it works for. Well, in short, place the supreme positions.
    const hasAllowedRole = interaction.member.roles.cache.some((role) =>
      allowedRoles.includes(role.name)
    );

    if (!hasAllowedRole) {
      return interaction.reply({
        content: '❌ You do not have the necessary privileges to use this command.',
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel('canal');
    if (!channel.isTextBased()) {
      return interaction.reply({
        content: '❌ Choose a valid text channel!',
        ephemeral: true,
      });
    }

    // Records activity for audit
    console.log(`[Log de Comando] ${interaction.user.tag} usou o comando /setlogunbanned em ${interaction.guild.name}`);

    // Configures the channel for logs
    try {
      const logData = loadLog('unbanned');
      logData.logChannelId = channel.id;
      saveLog('unbanned', logData);

      await interaction.reply({
        content: `✅ Configured unban log channel: ${channel}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[Erro] Unable to save log data: ${error}`);
      interaction.reply({
        content: '❌ An error occurred when trying to save the configuration. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
