const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to configuration file
const boosterConfigPath = path.join(__dirname, '../data/boosterConfig.json');

// Initialize configuration file if it does not exist
if (!fs.existsSync(boosterConfigPath)) {
  fs.writeFileSync(
    boosterConfigPath,
    JSON.stringify(
      {
        boosterMessageChannel: null,
        boosterDetailsChannel: null,
      },
      null,
      2
    )
  );
}

// Functions for loading and saving configuration
function loadConfig() {
  return JSON.parse(fs.readFileSync(boosterConfigPath, 'utf-8'));
}

function saveConfig(config) {
  fs.writeFileSync(boosterConfigPath, JSON.stringify(config, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('booster')
    .setDescription('Manages push messages on the server.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setmessagechannel')
        .setDescription('Sets the channel for booster messages.')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Select the channel for messages.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setdetailschannel')
        .setDescription('Sets the channel for detailed impulse information.')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Select the channel for detailed information.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('senddetails')
        .setDescription('Sends the detailed message on the configured channel.')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const config = loadConfig();

    // Check if the user has administrator permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Permission denied!')
        .setDescription('You need **Administrator** permission to use this command.')
        .setTimestamp()
        .setFooter({ text: 'Booster System' });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (subcommand === 'setmessagechannel') {
      const channel = interaction.options.getChannel('channel');
      config.boosterMessageChannel = channel.id;
      saveConfig(config);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Configured Channel')
        .setDescription(`The channel for impulse messages has been set to <#${channel.id}>.`)
        .setTimestamp()
        .setFooter({ text: 'Booster System' });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'setdetailschannel') {
      const channel = interaction.options.getChannel('channel');
      config.boosterDetailsChannel = channel.id;
      saveConfig(config);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Configured Channel')
        .setDescription(`The detailed information channel has been set to <#${channel.id}>.`)
        .setTimestamp()
        .setFooter({ text: 'Booster System' });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'senddetails') {
      if (!config.boosterDetailsChannel) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Erro')
          .setDescription('The detailed information channel has not yet been configured.')
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const detailsChannel = interaction.guild.channels.cache.get(config.boosterDetailsChannel);
      if (!detailsChannel) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Erro')
          .setDescription('The configured detailed information channel no longer exists.')
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const detailsEmbed = new EmbedBuilder()
  .setColor('#FF73FA')
  .setTitle('Be Nitro Booster')
  .setDescription(
    'By supporting our server as a Nitro Booster, you not only demonstrate your commitment to our community, but also unlock exclusive powers and rewards. See what awaits our heroes:'
  )
  .addFields(
    { name: '🎖️ Exclusive Position', value: 'Receive the distinguished mark of honor with the title **@Nitro Booster** and shine in the members tab.', inline: false },
    { name: '🎁 Additional Position', value: 'Earn the role **@I was a Booster** as an eternal reminder of your support.', inline: false },
    { name: '✨ Divine Powers', value: 'Access exclusive channels, share adventures, and enjoy live broadcasts with the community.', inline: false },
    { name: '🎨 Change Nickname', value: 'Customize your nickname and express your individuality.', inline: false },
    { name: '😀 Stickers and Emojis', value: 'Send exclusive stickers and emojis.', inline: false },
    { name: '📊 Polls', value: 'Create polls and get community feedback.', inline: false },
    { name: '🎶 Sound Effects', value: 'Add fun to conversations with sound effects.', inline: false }
  )
  .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 })) // GIF as thumbnail
  .setFooter({
    text: 'Thanks for boosting our server!',
    iconURL: interaction.guild.iconURL({ dynamic: true }),
  });


      await detailsChannel.send({ embeds: [detailsEmbed] });

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Message Sent')
        .setDescription(`The detailed message was sent on the channel <#${detailsChannel.id}>.`)
        .setTimestamp();

      return interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
  },

  async onBoost(guild, user) {
    const config = loadConfig();
    if (!config.boosterMessageChannel) return;

    const messageChannel = guild.channels.cache.get(config.boosterMessageChannel);
    if (!messageChannel) return;

    const boosterRole = guild.roles.cache.get('YOUR-SERVER_ID'); // Here enter the booster job ID of your server
    if (boosterRole) {
      const member = guild.members.cache.get(user.id);
      if (member) {
        await member.roles.add(boosterRole).catch(console.error);
      }
    }

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Click here')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${guild.id}/${config.boosterDetailsChannel}`)
    );

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#FF73FA')
      .setTitle('🚀 Novo(a) Booster')
      .setDescription(
        `🎉 **THANK YOU FOR YOUR BOOST!** 🎉\n\n<@${user.id}> just boosted the server! 🥳`
      )
      .addFields(
        { name: '💎 Various perks have been unlocked!', value: 'Check out all the advantages you now have access to by clicking the button below!' },
        { name: '❤️ Your support is essential for our community!', value: 'Thank you very much for contributing to us!' }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: 'Booster System',
        iconURL: guild.iconURL({ dynamic: true }),
      });

    await messageChannel.send({ embeds: [welcomeEmbed], components: [buttonRow] });
  },
};
