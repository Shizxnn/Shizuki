const {
	Util,
	MessageEmbed
} = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytdlDiscord = require("ytdl-core-discord");
var ytpl = require('ytpl');
const sendError = require("../util/error")
const fs = require('fs');

module.exports = {
	info: {
		name: "playlist",
		description: "Para poner canciones(っ◔◡◔)っ",
		usage: "<YouTube Playlist URL | Playlist Name>",
		aliases: ["pl"],
	},

	run: async function (client, message, args) {
		const channel = message.member.voice.channel;
		if (!channel) return sendError("Lo siento, pero debes estar en un canal de voz para reproducir música.", message.channel);
		const url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
		var searchString = args.join(" ");
		const permissions = channel.permissionsFor(message.client.user);
		if (!permissions.has("CONNECT")) return sendError("No puedo conectarme a su canal de voz, asegúrese de tener los permisos adecuados.", message.channel);
		if (!permissions.has("SPEAK")) return sendError("No puedo conectarme a su canal de voz, asegúrese de tener los permisos adecuados.", message.channel);

		if (!searchString||!url) return sendError(`Usage: ${message.client.config.prefix}playlist <YouTube Playlist URL | Playlist Name>`, message.channel);
		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			try {
				const playlist = await ytpl(url.split("list=")[1]);
				if (!playlist) return sendError("Lista de reproducción no encontrada", message.channel)
				const videos = await playlist.items;
				for (const video of videos) {
					// eslint-disable-line no-await-in-loop
					await handleVideo(video, message, channel, true); // eslint-disable-line no-await-in-loop
				}
				return message.channel.send({
					embed: {
						color: "GREEN",
						description: `✅  **|**  Playlist: **\`${videos[0].title}\`** se agregó a la cola`
					}
				})
			} catch (error) {
				console.error(error);
				return sendError("Lista de reproducción no encontrada :(",message.channel).catch(console.error);
			}
		} else {
			try {
				var searched = await yts.search(searchString)

				if (searched.playlists.length === 0) return sendError("Looks like i was unable to find the playlist on YouTube", message.channel)
				var songInfo = searched.playlists[0];
				let listurl = songInfo.listId;
				const playlist = await ytpl(listurl)
				const videos = await playlist.items;
				for (const video of videos) {
					// eslint-disable-line no-await-in-loop
					await handleVideo(video, message, channel, true); // eslint-disable-line no-await-in-loop
				}
				let thing = new MessageEmbed()
					.setAuthor("La lista de reproducción se ha añadido a la cola.", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
					.setThumbnail(songInfo.thumbnail)
					.setColor("GREEN")
					.setDescription(`✅  **|**  Playlist: **\`${songInfo.title}\`** has been added \`${songInfo.videoCount}\` video to the queue`)
				return message.channel.send(thing)
			} catch (error) {
				return sendError("An unexpected error has occurred",message.channel).catch(console.error);
			}
		}

		async function handleVideo(video, message, channel, playlist = false) {
			const serverQueue = message.client.queue.get(message.guild.id);
			const song = {
				id: video.id,
				title: Util.escapeMarkdown(video.title),
				views: video.views ? video.views : "-",
				ago: video.ago ? video.ago : "-",
                                duration: video.duration,
				url: `https://www.youtube.com/watch?v=${video.id}`,
				img: video.thumbnail,
				req: message.author
			};
			if (!serverQueue) {
				const queueConstruct = {
					textChannel: message.channel,
					voiceChannel: channel,
					connection: null,
					songs: [],
					volume: 80,
					playing: true,
					loop: false
				};
				message.client.queue.set(message.guild.id, queueConstruct);
				queueConstruct.songs.push(song);

				try {
					var connection = await channel.join();
					queueConstruct.connection = connection;
					play(message.guild, queueConstruct.songs[0]);
				} catch (error) {
					console.error(`I could not join the voice channel: ${error}`);
					message.client.queue.delete(message.guild.id);
					return sendError(`I could not join the voice channel: ${error}`, message.channel);

				}
			} else {
				serverQueue.songs.push(song);
				if (playlist) return;
				let thing = new MessageEmbed()
					.setAuthor("La canción se ha añadido a la cola", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
					.setThumbnail(song.img)
					.setColor("YELLOW")
					.addField("Nombre", song.title, true)
					.addField("Duración", song.duration, true)
					.addField("Solicitado por", song.req.tag, true)
					.setFooter(`Vistas: ${song.views} | ${song.ago}`)
				return message.channel.send(thing);
			}
			return;
		}

async	function play(guild, song) {
			const serverQueue = message.client.queue.get(message.guild.id);
  let afk = JSON.parse(fs.readFileSync("./afk.json", "utf8"));
       if (!afk[message.guild.id]) afk[message.guild.id] = {
        afk: false,
    };
    var online = afk[message.guild.id]
    if (!song){
      if (!online.afk) {
        sendError("Saliendo del canal de voz\n\n¡Gracias por usar mi bot (っ◔◡◔)っ! [Buy Me a Coffee](https://www.buymeacoffee.com/Shizxn)", message.channel)
        message.guild.me.voice.channel.leave();//If you want your bot stay in vc 24/7 remove this line :D
        message.client.queue.delete(message.guild.id);
      }
            return message.client.queue.delete(message.guild.id);
}
 let stream = null; 
    if (song.url.includes("youtube.com")) {
      
      stream = await ytdl(song.url);
stream.on('error', function(er)  {
      if (er) {
        if (serverQueue) {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
  	  return sendError(`Ha ocurrido un error inesperado.\nPossible type \`${er}\``, message.channel)

         }
       }
     });
}
 
      serverQueue.connection.on("desconectar", () => message.client.queue.delete(message.guild.id));
			const dispatcher = serverQueue.connection
         .play(ytdl(song.url,{quality: 'highestaudio', highWaterMark: 1 << 25 ,type: "opus"}))
        .on("finish", () => {
            const shiffed = serverQueue.songs.shift();
            if (serverQueue.loop === true) {
                serverQueue.songs.push(shiffed);
            };
            play(guild, serverQueue.songs[0]);
        })

    dispatcher.setVolume(serverQueue.volume / 100);
let thing = new MessageEmbed()
				.setAuthor("Reproduciendo música!", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
				.setThumbnail(song.img)
				.setColor("BLUE")
				.addField("Nombre", song.title, true)
				.addField("Duración", song.duration, true)
				.addField("Solicitado por", song.req.tag, true)
				.setFooter(`Vistas: ${song.views} | ${song.ago}`)
    serverQueue.textChannel.send(thing);
}


	},



};
