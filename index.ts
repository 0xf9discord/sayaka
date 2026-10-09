import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
} from "discord.js";

import notify_all from "./command/notify-all";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

const commands = new Collection<string, any>();

for (const command of [notify_all,]) {
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
    console.error(error);

    const message = {
      content: "명령어 실행 중 오류가 발생했습니다.",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(message);
    } else {
      await interaction.reply(message);
    }
  }
});

await client.login(process.env.DISCORD_TOKEN);
