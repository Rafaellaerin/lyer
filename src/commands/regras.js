const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Displays the server rules. (Administrators only)'), 

  async execute(interaction) {
    // Verify if the user has Administrator permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Permission Denied')
        .setDescription('You need the **Administrator** permission to use this command.')
        .setTimestamp()
        .setFooter({ text: 'Rules System', iconURL: interaction.guild.iconURL({ dynamic: true }) });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Respond privately to prevent "user used the command" visibility
    await interaction.reply({ content: 'Sending the rules...', ephemeral: true });

    // Embed with the rules
    const rulesEmbed = new EmbedBuilder()
      .setColor('#7700FF') // Elegant purple
      .setTitle('📕 Server Rules and Guidelines')
      .setDescription(
        '**Chat and Voice Behavior Rules**\n\n' +
        '1: Do not scream in voice calls. Keep the volume level appropriate.\n' +
        '2: Avoid adding bots playing music or audio at high volumes.\n' +
        '3: Maintain a friendly attitude in all interactions with other users.\n' +
        '4: Be considerate and helpful towards other users.\n' +
        '5: Do not flood text channels with repeated or nonsensical messages.\n' +
        '6: Avoid excessive use of special characters, emojis, or caps lock, as it can be considered annoying.\n' +
        '7: Do not join and leave calls repeatedly, as it can be disruptive.\n' +
        '8: Do not use voice modifiers, as this is extremely irritating.\n\n' +
        '**General Rules**\n\n' +
        '9: Any kind of discrimination, including homophobia, racism, or sexism, is not allowed.\n' +
        '10: Respect all users, regardless of their race, gender, etc.\n' +
        '11: Do not post inappropriate content, such as NSFW, violence, or hate speech.\n' +
        '12: Do not share false or misleading information (Fake News). This includes server-related news and other communications.\n' +
        '13: Use appropriate channels for each type of conversation or topic. This helps keep the server organized.\n' +
        '14: Profiles with inappropriate content or rule violations will be punished.\n' +
        '15: Do not share personal information, either yours or another member\'s, without permission.\n' +
        '16: Do not use secondary accounts to bypass punishments, as this will result in more severe penalties.\n\n' +
        '**Advertising Rules**\n\n' +
        '17: Unsolicited advertising in private messages is strictly prohibited.\n' +
        '18: Any illegal commerce or suspicious links, such as Discord invites or other harmful links, are prohibited. Social media links and platforms like YouTube or Twitch are generally allowed.\n' +
        '19: Do not flood channels with advertisements. Please promote in moderation.\n' +
        '20: Use appropriate channels for advertisements; improper use of channels for this purpose may result in severe punishments.\n\n' +
        '**Discord Terms**\n\n' +
        'This means that if someone violates the rules set in the Terms and Guidelines, they will be banned from the server and may have their account banned by Discord itself.\n\n' +
        'Breaking any of these rules may result in a ban without prior warning.\n\n' +
        'This list does not cover every possible rule, and our team may take action for misbehavior not explicitly mentioned above. At all times, use common sense before acting, as any rule violation will result in punishment.\n\n' +
        'Remember, the goal is to create a healthy and inclusive community for all members. Following these rules will help ensure that happens.'
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 })) // Server icon as a GIF
      .setFooter({
        text: 'Thank you for being part of our community!',
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp();

    // Send the rules embed in the channel
    await interaction.channel.send({ embeds: [rulesEmbed] });
  },
};
