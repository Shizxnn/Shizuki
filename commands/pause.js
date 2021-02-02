const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "pause",
    description: "Para pausar la música actual en el servidor",
    usage: "[pause]",
    aliases: ["pause"],
  },

  run: async function (client, message, args) {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
	    try{
      serverQueue.connection.dispatcher.pause()
	  } catch (error) {
        message.client.queue.delete(message.guild.id);
        return sendError(`:notes: The player has stopped and the queue has been cleared.: ${error}`, message.channel);
      }	    
      let xd = new MessageEmbed()
      .setDescription("⏸ ¡Música pausada!")
      .setColor("YELLOW")
      .setTitle("¡La música se ha pausado!")
      return message.channel.send(xd);
    }
    return sendError("No hay nada reproduciendose en este servidor..", message.channel);
  },
};
