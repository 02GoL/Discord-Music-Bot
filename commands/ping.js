const {SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong."),

    async execute({client,interaction}){
        await interaction.reply("pong");
    }
}
