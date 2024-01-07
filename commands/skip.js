const {SlashCommandBuilder,EmbedBuilder} = require("discord.js");
const {useQueue} = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song in the queue."),

    async execute({client,interaction}){
        try{
            await interaction.deferReply();
            const skipEmbed = new EmbedBuilder();
            
            const queue = useQueue(interaction.guild.id);

            if(!queue || !queue.isPlaying()){
                return interaction.editReply("Nothing to skip.");
            }else{
                queue.node.skip();
                
                if(!queue.isEmpty()){
                    const currentTrack = queue.currentTrack;

                    skipEmbed
                    .setTitle("Now playing")
                    .setThumbnail(currentTrack.thumbnail)
                    .setDescription(
                        `:musical_keyboard: **${currentTrack.title}** has been added to the queue.`
                    )
                    .addFields(
                        {name: "Duration", value: currentTrack.duration, inline: true},
                        {name: "Author", value: currentTrack.author, inline: true}
                    );
                    
                    await interaction.followUp({content: ":musical_keyboard: The current song has been skipped.", embeds: [skipEmbed]});
                }else{
                    await interaction.editReply(":musical_keyboard: The current song has been skipped and your queue is empty");
                }
            }
        }catch(error){
            console.log(error);
            await interaction.editReply("An error has occured...");
        }
    }
}
