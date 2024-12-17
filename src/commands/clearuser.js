const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearuser')
    .setDescription('Deletes messages from a specific user in the current channel.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user whose messages will be deleted')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (maximum: 1000).')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    // Verify permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Insufficient Permissions')
        .setDescription('You need the **Manage Messages** permission to use this command.')
        .setFooter({ text: 'Command: clearuser' })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (amount < 1 || amount > 1000) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('❌ Invalid Amount')
        .setDescription('Please enter a number between **1** and **1000**.')
        .setFooter({ text: 'Command: clearuser' })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel;
    let deletedCount = 0;

    try {
      while (deletedCount < amount) {
        const deleteAmount = Math.min(amount - deletedCount, 100); // Limits to 100 messages per batch
        const messages = await channel.messages.fetch({ limit: deleteAmount });
        const userMessages = messages.filter((msg) => msg.author.id === user.id);

        if (userMessages.size === 0) break; // Exit the loop if there are no more user messages

        await channel.bulkDelete(userMessages, true); // true ignores messages older than 14 days
        deletedCount += userMessages.size;

        if (userMessages.size < deleteAmount) break; // Exit the loop if there are no more messages to delete
      }

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Cleanup Completed')
        .setDescription(
          `A total of **${deletedCount} messages** from user **${user.tag}** were deleted in channel **${channel.name}**.`
        )
        .setFooter({ text: 'Command: clearuser' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error deleting user messages:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error Deleting Messages')
        .setDescription('An error occurred while trying to delete this user\'s messages.')
        .setFooter({ text: 'Command: clearuser' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
