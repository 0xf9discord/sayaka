import { REST, Routes } from "discord.js";
import notify_all from "./command/notify-all";
import ping from "./command/ping";
import announce from "./command/announce";
import ticket from "./command/ticket";
import moderation from "./command/moderation";
import status from "./command/status";

const { DISCORD_TOKEN: token, CLIENT_ID: clientId, GUILD_ID: guildId } = process.env;
if (!token || !clientId || !guildId) {
  throw new Error(".env에 DISCORD_TOKEN, CLIENT_ID, GUILD_ID를 모두 설정하세요.");
}
const commands = [notify_all, ping, announce, ticket, moderation, status].map((command) => command.data.toJSON());
const rest = new REST({ version: "10" }).setToken(token);

try {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
  });
  console.log(`${commands.length}개 슬래시 명령어 등록 완료: ${commands.map(c => c.name).join(", ")}`);
} catch (error) {
  console.error("명령어 등록 실패:", error);
  process.exitCode = 1;
}
