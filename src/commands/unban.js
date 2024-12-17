const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadLog } = require('../utils/logDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbane um usuário pelo ID.')
    .addStringOption((option) =>
      option.setName('user_id').setDescription('ID do usuário a ser desbanido').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('motivo')
        .setDescription('Motivo para o desbanimento')
        .setRequired(false)
    ),
  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('motivo') || 'Sem motivo especificado';

    // Verificar permissões
    if (!interaction.member.permissions.has('BanMembers')) {
      return interaction.reply({
        content: '❌ Você não tem permissão para desbanir membros!',
        ephemeral: true,
      });
    }

    try {
      // Validar se o usuário está banido
      const bannedUsers = await interaction.guild.bans.fetch();
      const userBanInfo = bannedUsers.get(userId);

      if (!userBanInfo) {
        return interaction.reply({
          content: `❌ O ID **${userId}** não corresponde a nenhum usuário banido.`,
          ephemeral: true,
        });
      }

      // Desbanir o usuário
      await interaction.guild.members.unban(userId, reason);

      // Enviar logs para o canal configurado
      const logData = loadLog('unbanned');
      if (logData.logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logData.logChannelId);

        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Usuário Desbanido')
            .addFields(
              { name: 'Usuário', value: `${userBanInfo.user.tag}`, inline: true },
              { name: 'ID', value: `${userId}`, inline: true },
              { name: 'Motivo', value: reason, inline: false }
            )
            .setThumbnail(userBanInfo.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
              text: `Desbanido por ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      // Responder ao administrador
      const publicEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Usuário Desbanido')
        .addFields(
          { name: 'Usuário', value: `${userBanInfo.user.tag}`, inline: true },
          { name: 'ID', value: `${userId}`, inline: true },
          { name: 'Motivo', value: reason, inline: false }
        )
        .setThumbnail(userBanInfo.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `Desbanido por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [publicEmbed] });
    } catch (error) {
      console.error(`Erro ao desbanir o ID ${userId}:`, error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao tentar desbanir este usuário.',
        ephemeral: true,
      });
    }
  },
};
