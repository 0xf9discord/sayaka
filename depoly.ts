
import { REST, Routes } from "discord.js";

import notify_all from "./command/notify-all";
import ping from "./command/ping";

const commands = [notify_all, ping].map((cmd) =>
  cmd.data.toJSON()
);

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN!
);

await rest.put(
  Routes.applicationGuildCommands(
    process.env.CLIENT_ID!,
    process.env.GUILD_ID!
  ),
  { body: commands }
);

console.log("명령어 등록 완료");
