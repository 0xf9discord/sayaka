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
    .addStringOption((option) =>
      option.setName("message").setDescription("전송할 공지 내용").setRequired(true).setMaxLength(1900)
    )
    .addBooleanOption((option) =>
      option.setName("confirm").setDescription("전체 멤버에게 DM 발송하는 데 동의합니다.").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "서버에서만 사용할 수 있습니다.", flags: MessageFlags.Ephemeral });
      return;
    }
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({ content: "관리자만 사용할 수 있습니다.", flags: MessageFlags.Ephemeral });
      return;
    }
    if (!interaction.options.getBoolean("confirm", true)) {
      await interaction.reply({ content: "발송이 취소되었습니다. confirm을 true로 설정해야 합니다.", flags: MessageFlags.Ephemeral });
      return;
    }

    const message = interaction.options.getString("message", true);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const members = await interaction.guild.members.fetch();
    let success = 0;
    let failed = 0;
    let lastProgress = Date.now();

    for (const member of members.values()) {
      if (member.user.bot) continue;
      try {
        await member.send({ content: message, allowedMentions: { parse: [] } });
        success++;
      } catch (error) {
        failed++;
        console.error(`${member.user.tag} 전송 실패`, error);
      }
      // Interaction tokens expire after ~15 minutes. Avoid repeated updates on every DM.
      if (Date.now() - lastProgress > 60_000) {
        lastProgress = Date.now();
        await interaction.editReply(`공지 DM 전송 중... 성공 ${success}명 / 실패 ${failed}명`).catch(console.error);
      }
    }
    await interaction.editReply(`DM 공지 전송 완료. 성공: ${success}명 / 실패: ${failed}명`).catch(console.error);
  },
};
