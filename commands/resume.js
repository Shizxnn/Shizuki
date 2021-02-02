const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "resume",
    description: "Para reanudar la música en pausa",
    usage: "",
    aliases: [],
  },

  run: async function (client, message, args) {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      let xd = new MessageEmbed()
      .setDescription("▶ ¡Pongo la música por ti!")
      .setColor("YELLOW")
      .setAuthor("¡La música se ha reanudado!", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
      return message.channel.send(xd);
    }
    return sendError("No hay nada reproduciendose en este servidor..", message.channel);
  },
};
