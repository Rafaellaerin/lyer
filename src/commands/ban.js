const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { loadLog } = require('../utils/logDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server.')
    .addUserOption((option) =>
      option.setName('target').setDescription('Member to be banned').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for ban')
        .setRequired(false)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const targetMember = interaction.options.getMember('target'); // Target member
    const reason = interaction.options.getString('reason') || 'No reason specified';

    // Check executor permission
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.editReply({
        content: '❌ You are not allowed to ban members!',
      });
    }

    // Check if the target member exists
    if (!targetMember) {
      return interaction.editReply({
        content: '❌ The specified member was not found.',
      });
    }

    // Check job hierarchy of executor and target
    if (
      targetMember.roles.highest.position >= interaction.member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.member.id
    ) {
      return interaction.editReply({
        content: `❌ You can't banish **${targetMember.user.tag}** because he has a position equal to or greater than yours.`,
      });
    }

    // Check bot job hierarchy
    const botMember = interaction.guild.members.me;
    if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.editReply({
        content: `❌ I can't banish **${targetMember.user.tag}** because he has a position higher than or equal to mine.`,
      });
    }

    try {
      // Private message to banned member
      const dmEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚫 You have been banned!')
        .setDescription('You have been banned from a Discord server.')
        .addFields(
          { name: 'Server', value: interaction.guild.name, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({
          text: `Banido por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      try {
        await targetMember.send({ embeds: [dmEmbed] });
      } catch {
        console.warn(`Unable to send message to ${targetMember.user.tag}.`);
      }

      // Ban the member
      await targetMember.ban({ reason });

      // Ban log
      const logData = loadLog('banned');
      if (logData.logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logData.logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#FF4500')
            .setTitle('🚫 Banned Member')
            .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Banned User', value: `${targetMember.user.tag} (${targetMember.user.id})`, inline: false },
              { name: 'Banned By', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
              { name: 'Reason', value: reason, inline: false },
              { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setFooter({
              text: `Server ID: ${interaction.guild.id}`,
              iconURL: interaction.guild.iconURL({ dynamic: true }),
            })
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      // Reply to Executor
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Banning Completed Successfully')
        .setDescription(`**${targetMember.user.tag}** was banned from the server.`)
        .addFields(
          { name: 'Reason', value: reason, inline: false },
          { name: 'Executor', value: interaction.user.tag, inline: true }
        )
        .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: 'Moderation System',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(`Error banning member ${targetMember.user.tag}:`, error);
      return interaction.editReply({
        content: '❌ An error occurred while trying to ban this member.',
      });
    }
  },
};
