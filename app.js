// 'use strict';
const Discord = require('discord.js');

const ow = require('./ow.js');
const private = require('./private.js');

// discord インスタンス作成
const client = new Discord.Client();
// token
const token = private.discordToken;

// ready!!!
client.on('ready', () => {
  console.log('ready!');
})

// prefix
const prefix = '.';


// BOTが居るチャンネルにメッセージが発せられた時
client.on('message', message => {

  // Bot自身の発言を無視
  if (message.author.bot) return;

  // .ow
  if (message.content.startsWith(prefix + 'ow')) {
    // ow.jsに処理を投げる
    ow.returnOverwatchData(client, message);
  }

  // .tenki

  // .alert

  // .rain


})

// Connection to Discord
client.login(token);