const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "stop",
    description: "Para detener la música y despejar la cola",
    usage: "",
    aliases: [],
  },

  run: async function (client, message, args) {
    const channel = message.member.voice.channel
    if (!channel)return sendError("Lo siento, pero debes estar en un canal de voz para reproducir música.", message.channel);
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue)return sendError("No hay nada que pueda detener por ti.", message.channel);
   if(!serverQueue.connection)return
if(!serverQueue.connection.dispatcher)return
     try{
      serverQueue.connection.dispatcher.end();
      } catch (error) {
        message.guild.me.voice.channel.leave();
        message.client.queue.delete(message.guild.id);
        return sendError(`:notes: El jugador se ha detenido y la cola se ha despejado.: ${error}`, message.channel);
      }
    message.client.queue.delete(message.guild.id);
    serverQueue.songs = [];
    message.react("✅")
  },
};