import { ChannelType, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('공지').setDescription('임베드 공지를 채널에 게시합니다.')
    .addStringOption(o => o.setName('제목').setDescription('공지 제목').setRequired(true).setMaxLength(256))
    .addStringOption(o => o.setName('내용').setDescription('공지 본문').setRequired(true).setMaxLength(4000))
    .addChannelOption(o => o.setName('채널').setDescription('전송할 텍스트 채널 (기본: 현재 채널)').addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild()) { await interaction.reply({ content: '서버에서만 가능합니다.', flags: MessageFlags.Ephemeral }); return; }
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) { await interaction.reply({content:'메시지 관리 권한이 필요합니다.', flags:MessageFlags.Ephemeral}); return; }
    const channel = interaction.options.getChannel('채널') ?? interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) { await interaction.reply({content:'텍스트 채널을 선택하세요.', flags:MessageFlags.Ephemeral}); return; }
    const me = await interaction.guild!.members.fetchMe();
    if (!channel.permissionsFor(me)?.has([PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.EmbedLinks])) { await interaction.reply({content:'봇에 채널 보기·메시지 보내기·링크 첨부 권한이 필요합니다.',flags:MessageFlags.Ephemeral}); return; }
    const embed = new EmbedBuilder().setTitle(interaction.options.getString('제목',true)).setDescription(interaction.options.getString('내용',true)).setColor(0x5865f2).setTimestamp().setFooter({text:`공지 · ${interaction.user.username}`});
    await channel.send({embeds:[embed],allowedMentions:{parse:[]}});
    await interaction.reply({content:`공지 전송 완료: <#${channel.id}>`, flags:MessageFlags.Ephemeral});
  }
};
