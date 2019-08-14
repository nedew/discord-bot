'use strict';
const request = require('request');
const { mc_address, discord_channel_id, icons } = require('../config.json');

exports.confirmationMcServerStatus = (client) => {
  let serverStatus;
  let options = {
    url: `https://mcapi.us/server/status?ip=${mc_address}`,
    method: 'GET',
    json: true
  }

  // 発言させるメッセージの枠組み
  let msg = {embed: {
    color: 6790440,
    author: {
      name: 'Minecraft Server',
      icon_url: icons.mc_icon
    },
    title: 'The status of the server has been updated.',
    url: `https://mcsrvstat.us/server/${mc_address}`,
    description: ``,
    timestamp: new Date(),
    footer: {
      icon_url: client.user.avatarURL,
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

  setInterval(() => {

    request(options, (err, res, data) => {
      // エラーがある場合は内容を出力して終了
      if (err) {
        console.log(err);
        return;
      }

      // 前回取得時からサーバー状態が更新された場合のみ通知（例外として初回時も実行される）
      if (serverStatus !== data.online) {
        serverStatus = data.online;
        console.log(data.online);
        let statusText;

        if (data.online) {
          statusText = 'オンライン';
          if (msg.embed.fields[1]) msg.embed.fields.pop();
          msg.embed.fields.push({
            name: 'Version',
            value: data.server.name,
            inline: true
          });
        } else {
          statusText = 'オフライン';
        }
        data.online ? statusText = 'オンライン' : statusText = 'オフライン';

        msg.embed.description = `サーバーが**${statusText}**になりました`;
        msg.embed.timestamp = new Date();

        client.channels.get(discord_channel_id).send(msg);
        console.log(`The status of the server has been updated: ${data}`);
      }

    });
  }, 70000);
}