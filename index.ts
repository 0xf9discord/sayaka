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
for (const command of [notify_all, ping]) {
  commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`로그인 완료: ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
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
