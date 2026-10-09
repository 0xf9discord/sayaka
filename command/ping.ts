
import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("핑")
    .setDescription("봇의 핑을 확인합니다."),

  async execute(interaction: ChatInputCommandInteraction) {
    const start = Date.now();

    await interaction.reply("핑 측정 중입니다.");

    const message = await interaction.fetchReply();

    const latency = message.createdTimestamp - interaction.createdTimestamp;
    const apiPing = Date.now() - start;
    const wsPing = interaction.client.ws.ping;

    await interaction.editReply({
      content:
        `**퐁!**\n` +
        `웹소켓 핑: **${wsPing}ms**\n` +
        `응답 지연: **${latency}ms**\n` +
        `API 처리 시간: **${apiPing}ms**`,
    });
  },
};
