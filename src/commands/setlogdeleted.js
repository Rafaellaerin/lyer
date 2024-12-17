const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to the JSON file for saving the log channel
const logFilePath = path.join(__dirname, '../data/logMessageDeleted.json');

// Initialize the JSON file if it does not exist
function initializeLogFile() {
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, JSON.stringify({ logChannelId: null }, null, 2));
  }
}

// Load the log channel ID
function loadLogChannel() {
  initializeLogFile();
  return JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
}

// Save the log channel ID
function saveLogChannel(logChannelId) {
  fs.writeFileSync(logFilePath, JSON.stringify({ logChannelId }, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogdeleted')
    .setDescription('Sets the channel for deleted message logs.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel where deleted message logs will be sent.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    // Verify if the channel is valid
    if (!channel.isTextBased() || channel.type !== ChannelType.GuildText) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Invalid Channel')
        .setDescription('Please select a valid text channel.')
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Verify permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Insufficient Permissions')
        .setDescription('You need the **Manage Messages** permission to use this command.')
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Save the log channel ID
    saveLogChannel(channel.id);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Log Channel Set')
      .setDescription(`Deleted message logs will be sent to ${channel}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Event to log deleted messages
    interaction.client.on('messageDelete', async (message) => {
      if (!message.guild || message.author.bot) return; // Ignore bot messages or messages outside guilds

      const logData = loadLogChannel();
      const logChannelId = logData.logChannelId;

      if (!logChannelId) return; // Exit if no log channel is set

      const logChannel = message.guild.channels.cache.get(logChannelId);
      if (!logChannel) return; // Exit if the log channel no longer exists

      // Create the log embed
      const embed = new EmbedBuilder()
        .setColor('#2F3136') // Dark gray color
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `:wastebasket: **Message sent by ${message.author} deleted in ${message.channel}.**`
        )
        .addFields(
          { name: 'Content', value: message.content || 'No content (possibly an attachment).' }
        )
        .setFooter({
          text: `--YOUR_SERVER_NAME-- • ${new Date().toLocaleTimeString('en-US')} • ${new Date().toLocaleDateString('en-US')}`, // here you can put the name of your server or some other text.
        })
        .setTimestamp();

      try {
        await logChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Error sending deleted message log:', error);
      }
    });
  },
};
