const {SlashCommandBuilder} = require("discord.js");
const {useQueue, QueueRepeatMode} = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Loops songs.")
    .addSubcommand((subCommand) => 
        subCommand
        .setName("song")
        .setDescription("Loops the current song.")
    ) 
    .addSubcommand((subCommand) => 
        subCommand
        .setName("queue")
        .setDescription("Loops the current queue.")
    )
    .addSubcommand((subCommand) => 
        subCommand
        .setName("off")
        .setDescription("Turns the loop off.")
    ),

    async execute({client,interaction}){
        try{
            await interaction.deferReply();
            const queue = useQueue(interaction.guild.id);     
            if(!queue || !queue.isPlaying()){
                return await interaction.editReply("The current queue is empty.");
            }
            if(interaction.options.getSubcommand() == "song"){
                queue.setRepeatMode(QueueRepeatMode.TRACK);
                return await interaction.editReply("The current track will loop.")
            }else if(interaction.options.getSubcommand() == "queue"){
                queue.setRepeatMode(QueueRepeatMode.QUEUE);
                return await interaction.editReply("The current queue will loop.")
            }else if(interaction.options.getSubcommand() == "off"){
                queue.setRepeatMode(QueueRepeatMode.OFF);
                return await interaction.editReply("Loop is disabled.")
            }
        }catch(error){
            console.log(error);
            await interaction.editReply("An error has occured...");
        }
    }
}
