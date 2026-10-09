import os from 'node:os';
import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
function duration(sec:number){const d=Math.floor(sec/86400),h=Math.floor(sec%86400/3600),m=Math.floor(sec%3600/60);return `${d}일 ${h}시간 ${m}분`;}
export default {
 data:new SlashCommandBuilder().setName('봇상태').setDescription('봇 상태, CPU, 메모리, 업타임을 확인합니다.'),
 async execute(i:ChatInputCommandInteraction){
  const memory=process.memoryUsage();const mb=(n:number)=>(n/1024/1024).toFixed(1);
  await i.reply({content:[`**Sayaka 상태**`,`웹소켓 핑: ${i.client.ws.ping}ms`,`봇 업타임: ${duration(process.uptime())}`,`서버 업타임: ${duration(os.uptime())}`,`봇 RSS 메모리: ${mb(memory.rss)}MB`,`시스템 여유 메모리: ${mb(os.freemem())} / ${mb(os.totalmem())}MB`,`CPU: ${os.cpus().length}개 논리 코어 · 부하(1분): ${os.loadavg()[0]?.toFixed(2) ?? 'N/A'}`].join('\n'),flags:MessageFlags.Ephemeral});
 }
};
