const {SlashCommandBuilder} = require("discord.js");
const {voice} = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("shutdown")
    .setDescription("Shuts down the bot. No touchy.")
    .addStringOption((option) => 
        option
        .setName("confirm")
        .setDescription("Type [yes] to confirm")
        .setRequired(true)
    ),

    async execute({client,interaction}){
        if(interaction.user.id == process.env.OWNERID && interaction.options.getString("confirm") == "yes"){
            await interaction.reply("Shutting down, goodbye...");
            await sleep(5000);
            process.exit();
        }else{
            await interaction.reply(":<");
        }
    }
}

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve,ms));
};