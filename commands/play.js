const {SlashCommandBuilder,EmbedBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder,ComponentType} = require("discord.js");
const {QueryType} = require("discord-player");
const {useMainPlayer} = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song.")
    .addSubcommand((subCommand) => 
        subCommand
        .setName("song")
        .setDescription("Add a song to the queue.")
        .addStringOption((option) => 
            option
            .setName("input")
            .setDescription("URL of a song.")
            .setRequired(true)
        )
    ) 
    .addSubcommand((subCommand) => 
        subCommand
        .setName("playlist")
        .setDescription("Add a playlist to the queue.")
        .addStringOption((option) => 
            option
            .setName("input")
            .setDescription("URL of a playlist.")
            .setRequired(true)
        )
    )
    .addSubcommand((subCommand) => 
        subCommand
        .setName("search")
        .setDescription("Seach a song to add to the queue.")
        .addStringOption((option) => 
            option
            .setName("input")
            .setDescription("Search term of the song.")
            .setRequired(true)
        )
    ),

    async execute({client,interaction}){
        try{
            await interaction.deferReply()
            if(!interaction.member.voice.channel){
                return interaction.editReply("No call to join.");
            }
    
            const embedList = new EmbedBuilder();
            const player = useMainPlayer();
            const queue = await client.player.nodes.create(interaction.guild.id,{
                metadata: {
                    interaction: interaction,
                    channel: interaction.channel,
                    client: interaction.guild.members.me,
                    requestedBy: interaction.user,
                },
                leaveOnEmpty: true,
                leaveOnEnd: true,
                leaveOnEmptyCooldown: 2500,
                leaveOnEndCooldown: 2500,
            });
            var url = interaction.options.getString("input");
    
            if(url == null){
                return interaction.editReply("Nothing has been entered.");
            }
        
            const searchResult = await interaction.client.player.search(url);

            if(searchResult.tracks.length == 0){
                return interaction.editReply("No song has been found.")
            }

            if(!queue.connection){
                await queue.connect(interaction.member.voice.channel);
            }

            if(interaction.options.getSubcommand() == "song"){
                const tracks = searchResult.tracks[0];

                embedList
                .setTitle("Adding to queue")
                .setThumbnail(tracks.thumbnail)
                .setDescription(
                    `:musical_keyboard: **${tracks.title}** has been added to the queue.`
                )
                .addFields(
                    {name: "Duration", value: tracks.duration, inline: true},
                    {name: "Author", value: tracks.author, inline: true}
                );

                await queue.addTrack(tracks);
                await interaction.editReply({embeds: [embedList]});

            }else if(interaction.options.getSubcommand() == "playlist"){
                const tracks = searchResult.tracks;
                const pageCount = Math.ceil(tracks.length/10);

                var tracksList = [];
                var songCount = 1;
                var currentPage = 1;
                
                tracks.forEach((songName) => {
                    tracksList.push(songCount + ". " + songName);
                    songCount++;
                });

                var sliceRange = 0;
                var list = tracksList.slice(sliceRange,sliceRange+10).join("\n");

                embedList
                .setTitle("Adding to queue")
                .setThumbnail(tracks[0].thumbnail)
                .setDescription(
                    `${list}`
                )
                .setFooter({text: `Page ${currentPage} of ${pageCount}`});

                await queue.addTrack(tracks);
                
                if(tracks.length > 10){
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

                    const songListMessage = await interaction.editReply({embeds: [embedList], components: [row]});

                    const collector = songListMessage.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        time: 30_000
                    });

                    collector.on("collect", async (songListInteraction) => {
                        await songListInteraction.deferReply();
                        if(songListInteraction.customId == "nextButton"){
                            sliceRange+=10;
                            currentPage++;
                            if(sliceRange > tracks.length){
                                sliceRange = 0;
                                currentPage = 1;
                            }
                            list = tracksList.slice(sliceRange,sliceRange+10).join("\n");
                
                            embedList
                            .setTitle("Adding to queue")
                            .setDescription(
                                `${list}`
                            )
                            .setFooter({text: `Page ${currentPage} of ${pageCount}`});

                            await interaction.editReply({embeds: [embedList], components: [row]});
                            await songListInteraction.editReply({embeds: [embedList], components: [row]});
                            await songListInteraction.deleteReply();
                        }
                        if(songListInteraction.customId == "backButton"){
                            sliceRange-=10;
                            currentPage--;
                            if(sliceRange < 0){
                                sliceRange = Math.ceil(tracks.length/10)*10-10;
                                currentPage = Math.ceil(tracks.length/10);
                            }
                            list = tracksList.slice(sliceRange,sliceRange+10).join("\n");
                
                            embedList
                            .setTitle("Adding to queue")
                            .setDescription(
                                `${list}`
                            )
                            .setFooter({text: `Page ${currentPage} of ${pageCount}`});

                            await interaction.editReply({embeds: [embedList], components: [row]});
                            await songListInteraction.editReply({embeds: [embedList], components: [row]});
                            await songListInteraction.deleteReply();
                        }
                    });
                    collector.on("end", () => {
                        next.setDisabled(true);
                        back.setDisabled(true);
                        interaction.editReply({embeds: [embedList]});
                    });
                }else{
                    await interaction.editReply({embeds: [embedList]});
                }
            }else if(interaction.options.getSubcommand() == "search"){
                const tracks = searchResult.tracks;
                if(url.includes("https://")){
                    const track = tracks[0];

                    embedList
                    .setTitle("Adding to queue")
                    .setThumbnail(track.thumbnail)
                    .setDescription(
                        `:musical_keyboard: **${track.title}** has been added to the queue.`
                    )
                    .addFields(
                        {name: "Duration", value: track.duration, inline: true},
                        {name: "Author", value: track.author, inline: true}
                    );

                    await queue.addTrack(track);
                    await interaction.editReply({embeds: [embedList]});
                }else{
                    var tracksList = [];
                    var songCount = 1;

                    for(var i = 0; i < 10; i++){
                        tracksList.push(songCount + ". " + tracks[i]);
                        songCount++;
                    }
                    
                    var list = tracksList.join("\n");
                    embedList
                    .setTitle("Searched results")
                    .setThumbnail(tracks[0].thumbnail)
                    .setDescription(
                        `${list}`
                    );

                    var selectedSong;

                    const messageFilter = input => {
                        return input.content >= 1 && input.content <= 10;
                    };

                    interaction.editReply({embeds: [embedList], fetchReply: true})
                    
                    await interaction.channel.awaitMessages({filter: messageFilter, max: 1, time: 10_000})
                    .then((input) =>{
                        selectedSong = tracks[input.first().content-1];
                    })
                    .catch((input) => {
                        selectedSong = tracks[0];
                        interaction.followUp("Selection timed out, playing the first song.");
                    });

                    embedList
                    .setTitle("Adding to queue")
                    .setThumbnail(selectedSong.thumbnail)
                    .setDescription(
                        `:musical_keyboard: **${selectedSong.title}** has been added to the queue.`
                    )
                    .addFields(
                        {name: "Duration", value: selectedSong.duration, inline: true},
                        {name: "Author", value: selectedSong.author, inline: true}
                    );

                    await queue.addTrack(selectedSong);
                    await interaction.followUp({embeds: [embedList]});
                }
            }
            if(!queue.node.isPlaying()){
                await queue.node.play();
            }
        }catch(error){
            console.log(error);
            await interaction.editReply("An error has occured...");
        }
    }
    
}

