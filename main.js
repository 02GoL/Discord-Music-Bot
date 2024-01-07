const {Events,GatewayIntentBits,Client, Collection} = require("discord.js");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
const {Player,useQueue} = require("discord-player");
const dotenv = require("dotenv");
const fs = require("fs");
const fileHandler = require("./utils/fileHandler");

dotenv.config();

const LOADCMD = process.argv[2] == "load";

const TOKEN = process.env.TOKEN;
const CLIENTID = process.env.CLIENTID;
const GUILDID = process.env.GUILDID.split(",");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.player = new Player(client,{
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

client.player.extractors.loadDefault();

client.commandSet = new Collection();

var commands = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for(const file of commandFiles){
    const filePath = "./commands/"+file;
    const fileData = require(filePath);
    client.commandSet.set(fileData.data.name,fileData);
    if(LOADCMD){
        commands.push(fileData.data.toJSON());
    }
}

if(LOADCMD){
    const rest = new REST({version: '10'}).setToken(TOKEN);
    (async() => {
    try{
        console.log('Started refreshing application (/) commands.');
        
        GUILDID.forEach(async (guildId) => {
            await rest.put(Routes.applicationGuildCommands(CLIENTID,guildId), {body: [commands]});
        });        
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }})();
}else{
    client.on("ready", (c) => {
        console.log("Bot is online");
    });
    client.on(Events.InteractionCreate, (interaction) => {
        async function commandHandler(){
            if(!interaction.isChatInputCommand()){
                return;
            }
            const commandData = client.commandSet.get(interaction.commandName);
            await commandData.execute({client,interaction});
        }
        commandHandler();
    });
    client.login(TOKEN);
}
