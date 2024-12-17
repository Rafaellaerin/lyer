const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to save automod settings
const configPath = path.join(__dirname, '../data/automodConfig.json');

// Initialize or patch the configuration file
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(
    configPath,
    JSON.stringify({
      logChannelId: null,
      blockedWords: [
        'wordblocked1', 'wordblocked2', 'wordblocked', // Here you can add the words that you don't want people to post on your server.
      ],
      allowLinks: false,
      allowedUsers: [],
      allowedRoles: [],
    }, null, 2)
  );
}

const loadConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const saveConfig = (config) => fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

// Automod state control variable
let isAutomodActive = false;

// Cache to monitor recently sent messages
const messageRateLimit = new Map();
const globalFloodThreshold = 15;
const userFloodThreshold = 5;
const checkInterval = 5000;

// Function to reset the cache periodically
setInterval(() => {
  messageRateLimit.clear();
}, checkInterval);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Manage the automatic moderation system.')
    .addSubcommand((subcommand) =>
      subcommand.setName('activate').setDescription('Activate the automatic moderation system.')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('deactivate').setDescription('Disables the automatic moderation system.')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('status').setDescription('Displays the status of the automod.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setlog')
        .setDescription('Sets the log channel for automod.')
        .addChannelOption((option) =>
          option.setName('channel').setDescription('Select text channel.').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('addword')
        .setDescription('Adds a word to the list of blocked words.')
        .addStringOption((option) =>
          option.setName('word').setDescription('The word to block.').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('allowuser')
        .setDescription('Allows a user to be exempt from automod.')
        .addUserOption((option) =>
          option.setName('user').setDescription('Select the user.').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('allowrole')
        .setDescription('Allows a position to be exempt from automod.')
        .addRoleOption((option) =>
          option.setName('role').setDescription('Select the position.').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('allowlinks')
        .setDescription('Allow or block links.')
        .addBooleanOption((option) =>
          option.setName('state').setDescription('Ativar links?').setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Permission denied!')
            .setDescription('You do not have permission to use this command.')
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const config = loadConfig();

    if (subcommand === 'activate') {
      if (isAutomodActive) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('🚨 Automod Already Active')
              .setDescription('Automod is already activated.')
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
      isAutomodActive = true;
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Automod Activated')
            .setDescription('The automatic moderation system has been activated.')
            .setTimestamp(),
        ],
      });
    }

    if (subcommand === 'deactivate') {
      if (!isAutomodActive) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('🚨 Automod Already Deactivated')
              .setDescription('Automod is already disabled.')
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
      isAutomodActive = false;
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Automod Disabled')
            .setDescription('The automatic moderation system has been disabled.')
            .setTimestamp(),
        ],
      });
    }

    if (subcommand === 'status') {
      const logChannel = config.logChannelId ? `<#${config.logChannelId}>` : 'Não configurado';
      const blockedWords = config.blockedWords.length > 0 ? config.blockedWords.join(', ') : 'Nenhuma palavra bloqueada';
      const allowedUsers = config.allowedUsers.length > 0
        ? config.allowedUsers.map((id) => `<@${id}>`).join(', ')
        : 'Nenhum usuário liberado';
      const allowedRoles = config.allowedRoles.length > 0
        ? config.allowedRoles.map((id) => `<@&${id}>`).join(', ')
        : 'Nenhum cargo liberado';
      const allowLinks = config.allowLinks ? 'Permitidos' : 'Bloqueados';

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(isAutomodActive ? '#00FF00' : '#FF0000')
            .setTitle('📊 Automod Status')
            .setDescription(
              `**Active:** ${isAutomodActive ? 'Yes' : 'No'}\n**Log Channel:** ${logChannel}\n` +
              `**Blocked Words:** ${blockedWords}\n**Released Users:** ${allowedUsers}\n` +
              `**Released Positions:** ${allowedRoles}\n**Links:** ${allowLinks}`
            )
            .setTimestamp(),
        ],
      });
    }

    if (subcommand === 'setlog') {
      const channel = interaction.options.getChannel('channel');
      if (channel.type !== ChannelType.GuildText) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Invalid Channel')
              .setDescription('Please select a valid text channel.')
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
      config.logChannelId = channel.id;
      saveConfig(config);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Configured Log Channel')
            .setDescription(`Automod logs will be sent to the channel ${channel}.`)
            .setTimestamp(),
        ],
      });
    }

    if (subcommand === 'addword') {
      const word = interaction.options.getString('word').toLowerCase();
      if (config.blockedWords.includes(word)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('⚠️ Word Already Blocked')
              .setDescription(`The word "${word}" is already blocked.`)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
      config.blockedWords.push(word);
      saveConfig(config);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Added Word')
            .setDescription(`The word "${word}" has been added to the list of blocked words.`)
            .setTimestamp(),
        ],
      });
    }

    if (subcommand === 'allowuser') {
      const user = interaction.options.getUser('user');
      if (config.allowedUsers.includes(user.id)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('⚠️ User Already Released')
              .setDescription(`The user **${user.tag}** is already released.`)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
      config.allowedUsers.push(user.id);
      saveConfig(config);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Released User')
            .setDescription(`User **${user.tag}** has been released from Automod.`)
            .setTimestamp(),
        ],
      });
    }

    if (subcommand === 'allowrole') {
      const role = interaction.options.getRole('role');
      if (config.allowedRoles.includes(role.id)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('⚠️ Position already released')
              .setDescription(`The role **${role.name}** is now available.`)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }
      config.allowedRoles.push(role.id);
      saveConfig(config);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Position Released')
            .setDescription(`The role **${role.name}** has been released from Automod.`)
            .setTimestamp(),
        ],
      });
    }

    if (subcommand === 'allowlinks') {
      const state = interaction.options.getBoolean('state');
      config.allowLinks = state;
      saveConfig(config);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(state ? '#00FF00' : '#FF0000')
            .setTitle(state ? '✅ Allowed Links' : '❌ Blocked Links')
            .setDescription(`Links are now ${state ? 'allowed' : 'blocked'} on the server.`)
            .setTimestamp(),
        ],
      });
    }
  },

  monitorMessages(client) {
    client.on('messageCreate', async (message) => {
      if (!isAutomodActive || message.author.bot || !message.guild) return;

      const config = loadConfig();
      const member = message.guild.members.cache.get(message.author.id);
      const logChannel = config.logChannelId
        ? message.guild.channels.cache.get(config.logChannelId)
        : null;

      // Ignore admins, users, and released rolesrgos
      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
      if (config.allowedUsers.includes(message.author.id)) return;
      if (config.allowedRoles.some((role) => member.roles.cache.has(role))) return;

      // Bulk message control
      const userMessages = messageRateLimit.get(message.author.id) || [];
      userMessages.push(Date.now());
      messageRateLimit.set(message.author.id, userMessages);

      const recentMessages = userMessages.filter((timestamp) => Date.now() - timestamp < checkInterval);
      if (recentMessages.length > userFloodThreshold) {
        await punishUser(message, member, logChannel, '🚨 Flood Detected', 'sent many messages.');
        return;
      }

      // Global control
      const allMessages = [...messageRateLimit.values()].flat();
      if (allMessages.filter((timestamp) => Date.now() - timestamp < checkInterval).length > globalFloodThreshold) {
        messageRateLimit.clear();
        await punishAllUsers(message.guild, logChannel, '🚨 Global Attack Detected', 'mass messages sent.');
        return;
      }

      // Link blocking
      if (!config.allowLinks && /(https?:\/\/[^\s]+)/.test(message.content)) {
        await punishUser(message, member, logChannel, '🚨 Link blocked', 'sent a prohibited link.');
        return;
      }

      // Word blocking
      const containsBlockedWord = config.blockedWords.some((word) => message.content.toLowerCase().includes(word));
      if (containsBlockedWord) {
        await punishUser(message, member, logChannel, '🚫 Forbidden Word', 'used a forbidden word.');
      }
    });

    async function punishUser(message, member, logChannel, title, reason) {
      await message.delete().catch(() => {});
      await member.timeout(60 * 1000, 'Automod Violation').catch(() => {});
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#222121')
            .setTitle('⚠️ You were punished by Automod')
            .setDescription(`Reason: **${reason}**`)
            .setTimestamp(),
        ],
      }).catch(() => {});
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor('#222121')
          .setTitle(title)
          .setDescription(`**${message.author.tag}** ${reason}`)
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }
    }

    async function punishAllUsers(guild, logChannel, title, reason) {
      const members = guild.members.cache.filter((m) => !m.user.bot);
      for (const member of members.values()) {
        await member.timeout(5 * 60 * 1000, 'Ataque Global Detectado').catch(() => {});
      }
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(title)
          .setDescription(reason)
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }
    }
  },
};
