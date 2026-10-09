import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
  type ChatInputCommandInteraction,
} from "discord.js";

import notify_all from "./command/notify-all";
import ping from "./command/ping";
import announce from "./command/announce";
import ticket, { handleTicketButton } from "./command/ticket";
import moderation from "./command/moderation";
import status from "./command/status";

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error(".env의 DISCORD_TOKEN을 설정하세요.");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

type Command = {
  data: { name: string };
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
const commands = new Collection<string, Command>();
for (const command of [notify_all, ping, announce, ticket, moderation, status]) {
  commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`로그인 완료: ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    try { await handleTicketButton(interaction); }
    catch (error) {
      console.error('티켓 버튼 처리 실패',error);
      const payload={content:'티켓 처리 중 오류가 발생했습니다. 봇의 권한과 로그를 확인하세요.',flags:MessageFlags.Ephemeral};
      if(interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(console.error);
      else await interaction.reply(payload).catch(console.error);
    }
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[${interaction.commandName}] 실행 실패`, error);
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: "명령어 실행 중 오류가 발생했습니다.",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "명령어 실행 중 오류가 발생했습니다.",
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (replyError) {
      console.error("오류 메시지 전송 실패", replyError);
    }
  }
});

await client.login(token);
