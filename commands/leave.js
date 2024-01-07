const {SlashCommandBuilder} = require("discord.js");
const {useQueue} = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Clears the queue and leaves the call."),

    async execute({client,interaction}){
        try{
            await interaction.deferReply();
            const queue = useQueue(interaction.guild.id);      
            if(!queue || !queue.isPlaying()){
                return interaction.editReply("Im not in a call.");
            }else{
                queue.delete();
            }
            await interaction.editReply("Goodbye...");
        }catch(error){
            console.log(error);
            await interaction.editReply("An error has occured...");
        }
    }
}
