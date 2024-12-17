const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to the JSON file for saving the log channel
const logFilePath = path.join(__dirname, '../data/logMessageEdited.json');

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
    .setName('setlogedited')
    .setDescription('Sets the channel for edited message logs.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel where edited message logs will be sent.')
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
      .setDescription(`Edited message logs will be sent to ${channel}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Event to log edited messages
    interaction.client.on('messageUpdate', async (oldMessage, newMessage) => {
      if (!newMessage.guild || newMessage.author.bot) return; // Ignore bot messages or messages outside guilds
      if (oldMessage.content === newMessage.content) return; // Ignore if the content has not changed

      const logData = loadLogChannel();
      const logChannelId = logData.logChannelId;

      if (!logChannelId) return; // Exit if no log channel is configured

      const logChannel = newMessage.guild.channels.cache.get(logChannelId);
      if (!logChannel) return; // Exit if the log channel no longer exists

      // Create the log embed
      const embed = new EmbedBuilder()
        .setColor('#2F3136') // Dark gray
        .setAuthor({
          name: newMessage.author.tag,
          iconURL: newMessage.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `✏️ **Message sent by ${newMessage.author} edited in ${newMessage.channel}. [Jump to Message](${newMessage.url})**`
        )
        .addFields(
          { name: 'Old', value: oldMessage.content || 'No content (possibly an attachment).' },
          { name: 'New', value: newMessage.content || 'No content (possibly an attachment).' }
        )
        .setFooter({
          text: `--YOUR_SERVER_NAME-- • ${new Date().toLocaleTimeString('en-US')} • ${new Date().toLocaleDateString('en-US')}`, // Here you can put your server name or something else.
        })
        .setTimestamp();

      try {
        await logChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Error sending edited message log:', error);
      }
    });
  },
};
