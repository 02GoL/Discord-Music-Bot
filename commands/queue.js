const {SlashCommandBuilder,EmbedBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder,ComponentType} = require("discord.js");
const {useQueue} = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows the current queue."),

    async execute({client,interaction}){
        try{
            await interaction.deferReply();
            const queueEmbed = new EmbedBuilder();
            const queue = useQueue(interaction.guild.id);

            if(!queue || !queue.isPlaying()){
                return interaction.editReply("The current queue is empty.");
            }

            const currentSong = queue.currentTrack;
            const currentQueue = queue.tracks.toArray();
            var pageCount = Math.ceil(currentQueue.length/10);
            if(pageCount == 0){
                pageCount = 1;
            }

            var queueList = [];
            var songCount = 1;
            var currentPage = 1;

            if(currentQueue.length == 0){
                queueList.push("Empty...")
            }else{
                currentQueue.forEach((songName) => {
                    queueList.push(songCount + ". " +songName);
                    songCount++;
                });
            }

            var sliceRange = 0;
            var list = queueList.slice(sliceRange,sliceRange+10).join("\n");
            
            queueEmbed
            .setTitle("Current queue")
            .setThumbnail(currentSong.thumbnail)
            .setDescription(
                `**Currently playing**\n:musical_keyboard: **${currentSong.title}**.`
            )
            .addFields(
                {name: "Duration", value: currentSong.duration, inline: true},
                {name: "Author", value: currentSong.author, inline: true},
                {name: "Current queue", value: `${list}`, inline: false}
            )
            .setFooter({text: `Page ${currentPage} of ${pageCount}`});
            
            if(currentQueue.length > 10){
                const next = new ButtonBuilder()
                .setLabel("Next")
                .setCustomId("nextButton")
                .setStyle(ButtonStyle.Primary);

                const back = new ButtonBuilder()
                .setLabel("Back")
                .setCustomId("backButton")
                .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder()
                .addComponents(back,next);

                const queueMessage = await interaction.editReply({embeds: [queueEmbed], components: [row]});

                const collector = queueMessage.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 45_000
                });
                //await interaction.deferReply();
                collector.on("collect", async (queueInteraction) => {
                    await queueInteraction.deferReply();
                    if(queueInteraction.customId == "nextButton"){
                        sliceRange+=10;
                        currentPage++;
                        if(sliceRange > currentQueue.length){
                            sliceRange = 0;
                            currentPage = 1;
                        }
                        list = queueList.slice(sliceRange,sliceRange+10).join("\n");
                        
                        queueEmbed.data.fields = null;

                        queueEmbed
                        .setTitle("Current queue")
                        .setThumbnail(currentSong.thumbnail)
                        .setDescription(
                            `**Currently playing**\n:musical_keyboard: **${currentSong.title}**.`
                        )
                        .addFields(
                            {name: "Duration", value: currentSong.duration, inline: true},
                            {name: "Author", value: currentSong.author, inline: true},
                            {name: "Current queue", value: `${list}`, inline: false}
                        )
                        .setFooter({text: `Page ${currentPage} of ${pageCount}`});

                        await interaction.editReply({embeds: [queueEmbed], components: [row]});
                        await queueInteraction.editReply({embeds: [queueEmbed], components: [row]});
                        await queueInteraction.deleteReply();
                    }
                    if(queueInteraction.customId == "backButton"){
                        sliceRange-=10;
                        currentPage--;
                        if(sliceRange < 0){
                            sliceRange = Math.ceil(currentQueue.length/10)*10-10;
                            currentPage = Math.ceil(currentQueue.length/10);
                        }
                        list = queueList.slice(sliceRange,sliceRange+10).join("\n");
                        
                        queueEmbed.data.fields = null;

                        queueEmbed
                        .setTitle("Current queue")
                        .setThumbnail(currentSong.thumbnail)
                        .setDescription(
                            `**Currently playing**\n:musical_keyboard: **${currentSong.title}**.`
                        )
                        .addFields(
                            {name: "Duration", value: currentSong.duration, inline: true},
                            {name: "Author", value: currentSong.author, inline: true},
                            {name: "Current queue", value: `${list}`, inline: false}
                        )
                        .setFooter({text: `Page ${currentPage} of ${pageCount}`});

                        await interaction.editReply({embeds: [queueEmbed], components: [row]});
                        await queueInteraction.editReply({embeds: [queueEmbed], components: [row]});
                        await queueInteraction.deleteReply();
                    }
                });
                collector.on("end", () => {
                    next.setDisabled(true);
                    back.setDisabled(true);
                    return interaction.editReply({embeds: [queueEmbed]});
                });
            }else{
                await interaction.editReply({embeds: [queueEmbed]});
            }
        }catch(error){
            console.log(error);
            await interaction.editReply("An error has occured...");
        }
    }
}
