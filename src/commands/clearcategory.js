const { SlashCommandBuilder, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearcategory')
    .setDescription('Clears all messages from text channels within a category.')
    .addChannelOption((option) =>
      option
        .setName('category')
        .setDescription('The category whose text channels will be cleared.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const categoryChannel = interaction.options.getChannel('category');

    // Verify if the selected channel is a category
    if (categoryChannel.type !== ChannelType.GuildCategory) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Invalid Category')
        .setDescription('Please select a valid **category**.')
        .setFooter({ text: 'Command: clearcategory' })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Verify permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Insufficient Permissions')
        .setDescription('You need the **Manage Messages** permission to use this command.')
        .setFooter({ text: 'Command: clearcategory' })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const textChannels = categoryChannel.guild.channels.cache.filter(
      (channel) => channel.parentId === categoryChannel.id && channel.type === ChannelType.GuildText
    );

    if (textChannels.size === 0) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('❌ No Text Channels')
        .setDescription(`The category **${categoryChannel.name}** contains no text channels.`)
        .setFooter({ text: 'Command: clearcategory' })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    let totalDeleted = 0;

    try {
      for (const channel of textChannels.values()) {
        let deletedCount = 0;

        while (true) {
          const messages = await channel.messages.fetch({ limit: 100 });
          if (messages.size === 0) break;

          const deleted = await channel.bulkDelete(messages, true); // true ignores messages older than 14 days
          deletedCount += deleted.size;

          if (deleted.size < 100) break; // Exit loop if there are no more messages to delete
        }

        totalDeleted += deletedCount;
        console.log(`✅ Deleted ${deletedCount} messages in channel ${channel.name}`);
      }

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Cleanup Completed')
        .setDescription(
          `A total of **${totalDeleted} messages** were deleted from all text channels in the category **${categoryChannel.name}**.`
        )
        .setFooter({ text: 'Command: clearcategory' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error deleting messages in category:', error);
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error Deleting Messages')
        .setDescription(
          `An error occurred while attempting to delete messages in the channels of category **${categoryChannel.name}**.`
        )
        .setFooter({ text: 'Command: clearcategory' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
