'use strict';
const request = require('request');
const { mc_address, icons } = require('../config.json');

// 初期値
let timestamp = Date.now();

module.exports = {
  name: 'mc',
  aliases: ['minecraft', 'マイクラ'],
  description: 'Minecraft関係',
  args: true,
  usage: ``,
  guildOnly: false,
  cooldown: 4,  
  execute(message, args) {

    if (args[0] === 'ping') {
      // 前回コマンドを実行した時から指定の時間以上経過していなければ実行しない
      const elapsedTime = Date.now() - timestamp;
      if (elapsedTime < 60000) {
        message.reply(`このコマンドは${Math.floor(60 - (elapsedTime / 1000))}秒後に実行可能になります`);
        return;
      } 

      // Get request options
      let options = {
        url: `https://api.mcsrvstat.us/1/${mc_address}`,
        method: 'GET',
        json: true
      }

      // embedメッセージの初期設定
      let msg = {embed: {
        color: 6790440,
        author: {
          name: 'Minecraft Server',
          icon_url: icons.mc_icon
        },
        title: 'Corrent server status',
        url: `https://mcsrvstat.us/server/${mc_address}`,
        description: ``,
        timestamp: new Date(),
        footer: {
          icon_url: message.client.user.avatarURL,
          text: '© nedew'
        },
        fields: [
          {
            name: 'Address',
            value: mc_address,
            inline: true
          }
        ]
      }};

      request.get(options, (err, res, data) => {
        console.log('Get Server Status!');
        timestamp = Date.now();

        if (err) {
          console.log(err);
          return;
        }

        let statusText;

        // data.offline === trueの時はサーバがオフライン
        if (data.offline) {
          statusText = 'オフライン';
        } else {
          statusText = 'オンライン';

          let players;

          // オンラインのプレイヤーがいれば処理を実行
          if (data.players.online) {
            data.players.list.forEach((player) => {
              // players === 0の時とそれ以上の整数値の時で分岐
              !players ? players = player : players += `\n${player}`;
            });
          } else players = '現在オンラインのプレイヤーはいません';

          msg.embed.fields.push(
            {
              name: 'Version',
              value: data.version,
              inline: true
            },
            {
              name: 'Players',
              value: players,
              inline: true
            }
          );
        }

        msg.embed.description = `サーバーは現在**${statusText}**です`;
        msg.embed.timestamp = new Date();

        message.channel.send(msg);

        //if (1 < msg.embed.fields.length) msg.embed.fields.splice(1, msg.embed.fields.length - 1);
        msg.embed.fields.length = 1;
      });
    }
  }
}