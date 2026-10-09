import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("핑")
    .setDescription("봇의 핑을 확인합니다."),

  async execute(interaction: ChatInputCommandInteraction) {
    const started = Date.now();
    await interaction.reply("핑 측정 중입니다.");
    const reply = await interaction.fetchReply();
    const responseLatency = reply.createdTimestamp - interaction.createdTimestamp;
    const apiTime = Date.now() - started;
    const websocketLatency = interaction.client.ws.ping;
    await interaction.editReply(
      `**퐁!**\n웹소켓 핑: **${websocketLatency}ms**\n응답 지연: **${responseLatency}ms**\nAPI 처리 시간: **${apiTime}ms**`
    );
  },
};
