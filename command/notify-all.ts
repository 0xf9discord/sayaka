
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  type ChatInputCommandInteraction,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("notify_all")
    .setDescription("서버 전체 인원에게 DM 공지를 보냅니다.")
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("전송할 공지 내용입니다.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    ),

  async execute(Interaction: ChatInputCommandInteraction) {
    if (!Interaction.guild) return;

    if (!Interaction.memberPermissions?.has(
      PermissionFlagsBits.Administrator
    )) {
      await Interaction.reply({
        content: "관리자만 사용이 가능합니다.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const message = Interaction.options.getString("message", true);

    await Interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const members = await Interaction.guild.members.fetch();

    let success = 0;
    let failed = 0;

    for (const member of members.values()) {
      if (member.user.bot) continue;

      try {
        await member.send({
          content: message,
          allowedMentions: { parse: [] },
        });
        success++;
      } catch (error) {
        failed++;
        console.error(`${member.user.tag} 전송 실패`, error);
      }
    }

    await Interaction.editReply({
      content:
        `DM에 공지를 전송했습니다.\n` +
        `성공: ${success}명\n` +
        `실패: ${failed}명`,
    });
  },
};
