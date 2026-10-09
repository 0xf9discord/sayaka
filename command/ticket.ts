import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, type ButtonInteraction, type ChatInputCommandInteraction } from 'discord.js';
const OPEN='sayaka:ticket:open';const CLOSE='sayaka:ticket:close';
const ownerPrefix='sayaka-ticket-owner:';
export default {
  data:new SlashCommandBuilder().setName('티켓설치').setDescription('현재 채널에 문의 티켓 버튼을 설치합니다.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(o=>o.setName('카테고리').setDescription('티켓을 생성할 카테고리 (생략 시 현재 채널과 같은 카테고리)').addChannelTypes(ChannelType.GuildCategory)),
  async execute(i:ChatInputCommandInteraction){
    if (!i.inCachedGuild() || !i.channel || i.channel.type!==ChannelType.GuildText){await i.reply({content:'서버 텍스트 채널에서만 가능합니다.',flags:MessageFlags.Ephemeral});return;}
    if (!i.memberPermissions.has(PermissionFlagsBits.ManageGuild)){await i.reply({content:'서버 관리 권한이 필요합니다.',flags:MessageFlags.Ephemeral});return;}
    const me=await i.guild.members.fetchMe();
    if (!i.channel.permissionsFor(me)?.has([PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages])){await i.reply({content:'봇에 해당 채널 메시지 보내기 권한이 없습니다.',flags:MessageFlags.Ephemeral});return;}
    const category=i.options.getChannel('카테고리');
    const row=new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`${OPEN}:${category?.id ?? i.channel.parentId ?? 'none'}`).setLabel('문의 티켓 열기').setStyle(ButtonStyle.Primary));
    await i.channel.send({content:'**Sayaka 문의 센터**\n아래 버튼을 누르면 비공개 문의 채널이 생성됩니다.',components:[row],allowedMentions:{parse:[]}});
    await i.reply({content:'티켓 패널 설치 완료!',flags:MessageFlags.Ephemeral});
  }
};
export async function handleTicketButton(i:ButtonInteraction){
 if (!i.customId.startsWith('sayaka:ticket:'))return false;
 if (!i.inCachedGuild()){await i.reply({content:'서버에서만 사용 가능합니다.',flags:MessageFlags.Ephemeral});return true;}
 if (i.customId.startsWith(`${OPEN}:`)){
   await i.deferReply({flags:MessageFlags.Ephemeral});
   const guild=i.guild;const me=await guild.members.fetchMe();
   if (!me.permissions.has(PermissionFlagsBits.ManageChannels)){await i.editReply('봇에 채널 관리 권한이 필요합니다.');return true;}
   const existing=guild.channels.cache.find(c=>c.type===ChannelType.GuildText && c.topic===`${ownerPrefix}${i.user.id}`);
   if(existing){await i.editReply(`이미 문의 채널이 있습니다: <#${existing.id}>`);return true;}
   const categoryId=i.customId.slice(`${OPEN}:`.length);
   const parent=categoryId==='none'?null:categoryId;
   if(parent && guild.channels.cache.get(parent)?.type!==ChannelType.GuildCategory){await i.editReply('지정한 카테고리를 찾을 수 없습니다. 관리자에게 패널 재설치를 요청하세요.');return true;}
   const channel=await guild.channels.create({name:`ticket-${i.user.id}`,type:ChannelType.GuildText,parent,topic:`${ownerPrefix}${i.user.id}`,permissionOverwrites:[
     {id:guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},
     {id:i.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},
     {id:me.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ManageChannels,PermissionFlagsBits.ReadMessageHistory]},
   ]});
   const row=new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(CLOSE).setLabel('티켓 종료').setStyle(ButtonStyle.Danger));
   await channel.send({content:`<@${i.user.id}> 문의 내용을 작성해 주세요. 서버 관리자 또는 채널 접근 권한이 있는 운영자가 답변할 수 있습니다.\n(관리자: 티켓 조회 권한은 역할·서버 설정에 따라 달라질 수 있습니다.)`,components:[row],allowedMentions:{users:[i.user.id]}});
   await i.editReply(`문의 채널이 생성됐습니다: <#${channel.id}>`);return true;
 }
 if(i.customId===CLOSE){
   if (i.channel?.type!==ChannelType.GuildText || !i.channel.topic?.startsWith(ownerPrefix)){await i.reply({content:'티켓 채널에서만 가능합니다.',flags:MessageFlags.Ephemeral});return true;}
   const owner=i.channel.topic.slice(ownerPrefix.length);
   if(i.user.id!==owner && !i.memberPermissions.has(PermissionFlagsBits.ManageChannels)){await i.reply({content:'티켓 작성자 또는 채널 관리자만 종료할 수 있습니다.',flags:MessageFlags.Ephemeral});return true;}
   await i.reply({content:'티켓을 종료합니다.',flags:MessageFlags.Ephemeral});
   await i.channel.delete(`티켓 종료: ${i.user.id}`);return true;
 }
 await i.reply({content:'알 수 없는 티켓 작업입니다.',flags:MessageFlags.Ephemeral});return true;
}
