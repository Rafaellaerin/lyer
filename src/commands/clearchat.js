const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearchat')
    .setDescription('Deletes all messages from a specific channel.'),

  async execute(interaction) {
    // Verify permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Insufficient Permissions')
        .setDescription('You need the **Manage Messages** permission to use this command.')
        .setFooter({ text: 'Command: clearchat' })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Defer the response to avoid expiration
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel;

    try {
      let deletedCount = 0;
      let lastMessageId;

      // Loop to delete all messages
      while (true) {
        // Fetch messages in batches of 100
        const fetchedMessages = await channel.messages.fetch({
          limit: 100,
          ...(lastMessageId && { before: lastMessageId }), // Fetch messages before the last deleted message ID
        });

        // Exit the loop if there are no more messages to delete
        if (fetchedMessages.size === 0) break;

        // Delete the messages
        await channel.bulkDelete(fetchedMessages, true);
        deletedCount += fetchedMessages.size;

        // Update the last deleted message to continue the loop
        lastMessageId = fetchedMessages.last().id;
      }

      // Success message
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Cleanup Complete')
        .setDescription(`All messages in the channel **${channel.name}** were successfully deleted!`)
        .setFooter({ text: 'Command: clearchat' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error deleting messages:', error);

      // Error message
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error Deleting Messages')
        .setDescription(
          'An error occurred while attempting to delete all messages in this channel. Ensure the bot has sufficient permissions.'
        )
        .setFooter({ text: 'Command: clearchat' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
