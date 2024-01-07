const {SlashCommandBuilder} = require("discord.js");
const {useQueue} = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Removes a song from the queue.")
    .addIntegerOption((option) => 
        option
        .setName("position")
        .setDescription("Position of song is queue.")
        .setRequired(true)
    ),

    async execute({client,interaction}){
        try{
            await interaction.deferReply();
            const queue = useQueue(interaction.guild.id);
            const queueLength = queue.tracks.toArray().length;
            if(!queue){
                return await interaction.editReply("The current queue is empty.")
            }
            var position = interaction.options.getInteger("position");
            if(position >= 1 && position <= queueLength){
                await interaction.editReply(`:musical_keyboard: **${queue.tracks.toArray()[position-1].title}** was removed.`);
                return queue.node.remove(position-1);
            }else{
                return await interaction.editReply("Invalid entry.");
            }
        }catch(error){
            console.log(error);
            await interaction.editReply("An error has occured...");
        }
    }
}
