import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type GuildMember } from 'discord.js';
import { addWarning, getWarnings } from '../lib/warnings';
const data = new SlashCommandBuilder().setName('관리').setDescription('서버 경고, 차단, 청소 명령어').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand(s=>s.setName('경고').setDescription('경고를 기록합니다').addUserOption(o=>o.setName('대상').setDescription('대상 유저').setRequired(true)).addStringOption(o=>o.setName('사유').setDescription('경고 사유').setRequired(true).setMaxLength(500)))
  .addSubcommand(s=>s.setName('경고조회').setDescription('누적 경고 조회').addUserOption(o=>o.setName('대상').setDescription('대상 유저').setRequired(true)))
  .addSubcommand(s=>s.setName('차단').setDescription('유저를 서버에서 차단합니다').addUserOption(o=>o.setName('대상').setDescription('차단할 유저').setRequired(true)).addStringOption(o=>o.setName('사유').setDescription('차단 사유').setMaxLength(500)))
  .addSubcommand(s=>s.setName('청소').setDescription('최근 메시지를 삭제합니다 (14일 미만)').addIntegerOption(o=>o.setName('개수').setDescription('삭제 개수: 1~100').setRequired(true).setMinValue(1).setMaxValue(100)));

export default {data, async execute(i:ChatInputCommandInteraction) {
  if (!i.inCachedGuild()) { await i.reply({content:'서버에서만 사용할 수 있습니다.',flags:MessageFlags.Ephemeral}); return; }
  const sub=i.options.getSubcommand();
  const required = sub==='차단'?PermissionFlagsBits.BanMembers:sub==='청소'?PermissionFlagsBits.ManageMessages:PermissionFlagsBits.ModerateMembers;
  if (!i.memberPermissions.has(required)) { await i.reply({content:'이 작업을 할 권한이 없습니다.',flags:MessageFlags.Ephemeral}); return; }
  if (sub==='청소') {
    if (!i.channel || !('bulkDelete' in i.channel) || typeof i.channel.bulkDelete!=='function') { await i.reply({content:'청소할 수 없는 채널입니다.',flags:MessageFlags.Ephemeral});return; }
    const me=await i.guild.members.fetchMe();
    if (!i.channel.permissionsFor(me)?.has([PermissionFlagsBits.ViewChannel,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageMessages])) {await i.reply({content:'봇에 메시지 기록 보기 및 메시지 관리 권한이 필요합니다.',flags:MessageFlags.Ephemeral});return;}
    await i.deferReply({flags:MessageFlags.Ephemeral});
    const count=i.options.getInteger('개수',true);
    const deleted=await i.channel.bulkDelete(count,true);
    await i.editReply(`${deleted.size}개 메시지를 삭제했습니다. (14일 이상 된 메시지는 제외)`);return;
  }
  const user=i.options.getUser('대상',true);
  if (sub==='경고조회') {
    const warnings=getWarnings(i.guildId,user.id);
    await i.reply({content: warnings.length ? `${user.username}의 경고 ${warnings.length}건\n${warnings.slice(-10).map((w,n)=>`${n+1}. ${w.reason} (${new Date(w.at).toLocaleDateString('ko-KR')})`).join('\n')}` : `${user.username}의 경고 기록이 없습니다.`,flags:MessageFlags.Ephemeral});return;
  }
  if (user.id===i.user.id || user.id===i.client.user.id || user.id===i.guild.ownerId) {await i.reply({content:'본인, 봇, 서버 소유자는 대상으로 지정할 수 없습니다.',flags:MessageFlags.Ephemeral});return;}
  const target=await i.guild.members.fetch(user.id).catch(()=>null);
  const invoker=await i.guild.members.fetch(i.user.id);
  if (target && i.guild.ownerId!==i.user.id && target.roles.highest.comparePositionTo(invoker.roles.highest)>=0) {await i.reply({content:'본인과 같거나 높은 역할의 유저는 대상으로 지정할 수 없습니다.',flags:MessageFlags.Ephemeral});return;}
  if (sub==='경고') {
    const reason=i.options.getString('사유',true);
    const count=addWarning(i.guildId,user.id,i.user.id,reason);
    await i.reply({content:`${user.username} 경고 기록 완료 (누적 ${count}건)`,flags:MessageFlags.Ephemeral});return;
  }
  if (sub==='차단') {
    const me=await i.guild.members.fetchMe();
    if (!me.permissions.has(PermissionFlagsBits.BanMembers) || (target && !target.bannable)) {await i.reply({content:'봇의 차단 권한 또는 역할 순위를 확인하세요.',flags:MessageFlags.Ephemeral});return;}
    await i.guild.members.ban(user.id,{reason:`${i.user.username}: ${i.options.getString('사유') ?? '사유 없음'}`});
    await i.reply({content:`${user.username} 차단 완료`,flags:MessageFlags.Ephemeral});
  }
}};
