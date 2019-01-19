// Overwatchの統計データを取得・返す処理

'use strict';
/*
Copyright (c) 2016-2018 Alfred Gutierrez
Released under the MIT license
https://github.com/alfg/overwatch-api/blob/master/LICENSE
*/

// overwatch-apiの読み込み
const overwatch = require('overwatch-api');

// configファイルからprefixのみ読み込む
const { prefix, icons } = require('../config.json');

module.exports = {
  name: 'ow',
  aliases: ['overwatch', 'おば'],
  description: 'Overwatchの統計を返す',
  args: true,
  usage: `<battletag>\` または \`${prefix}ow <battletag> <pc/xbl/psn> <us/eu/kr/cn/global>\`\n例: \`${prefix}ow nedew#11506 pc us\``,
  guildOnly: false,
  cooldown: 4,
  execute(message, args) {

    // 書式が間違っていた場合のリプライ
    const owUsageMsg = `\n使用方法: \`${prefix}${this.name} ${this.usage}`;

    // デフォルト値を代入
    let tag, platform = 'pc', region = 'global';
    if (args[0] && !args[1]) {
      tag = args[0].replace('#', '-');
    } else if (args[0] && args[1] && args[2] && !args[3]) {
      tag = args[0].replace('#', '-'), platform = args[1], region = args[2];
    } else {
      // コマンドの書式が間違っていたら、その旨を伝えて処理を終了させる
      console.log('入力された引数が足りていないか多い');
      message.reply('入力された値が正しくないか、不足している、または余分に入力されている可能性があります。');
      return message.channel.send(owUsageMsg);
    }

    // Get Profile Data
    const owGetProf = new Promise(function(resolve, reject) {
      overwatch.getProfile(platform, region, tag, (err, data) => {
        err ? reject() : resolve(data);
      });
    });

    // Get Stats Data
    const owGetStats = new Promise(function(resolve, reject) {
      overwatch.getStats(platform, region, tag, (err, data) => {
        err ? reject() : resolve(data);
      });
    });

    Promise.all([owGetProf, owGetStats])
    .then((result) => {
      const gottenProfile = result[0], gottenStats = result[1];
      // Battle Tag
      const playerName = tag.replace('-', '#');
    
      //戦績の公開範囲によって分岐
      if (!gottenProfile.private) {
        message.channel.send({embed: {
          color: 16751616,
          author: {
            name: 'OVERWATCH',
            icon_url: icons.ow_icon
          },
          title: 'Stats for ' + playerName,
          url: `https://playoverwatch.com/ja-jp/career/${platform}/${playerName.replace('#', '-')}`,
          timestamp: new Date(),
          thumbnail: {
            url: gottenProfile.portrait
          },
          image: {
            url: gottenProfile.competitive.rank_img
          },
          footer: {
            icon_url: message.client.user.avatarURL,
            text: '© nedew'
          },
          fields: [
            {
              name: 'Account Stats',
              value: `Level: **${gottenProfile.level}**\n` +
                     `Rank: **${gottenProfile.competitive.rank}**\n` +
                     `Endorsement Level: **${gottenProfile.endorsement.level}**`,
              inline: true
            },
            {
              name: 'Medals in Quick Play',
              value: `Golden Medals: **${gottenStats.stats.match_awards.quickplay[2].value}**\n` +
                     `Silver Medals: **${gottenStats.stats.match_awards.quickplay[3].value}**\n` +
                     `Bronze Medals: **${gottenStats.stats.match_awards.quickplay[4].value}**`,
              inline: true
            },
            {
              name: 'Match Record',
              value: `__[QUICK PLAY]__\n` +
                     `Won: **${gottenStats.stats.game.quickplay[0].value}**\n` +
                     `Playtime: **${gottenStats.stats.game.quickplay[1].value.split(':')[0]}h**\n` +
                     `__[COMPETITIVE]__\n` +
                     `Won: **${gottenProfile.games.competitive.won}**\n` +
                     `Lost: **${gottenProfile.games.competitive.lost}**\n` +
                     `Draw: **${gottenProfile.games.competitive.draw}**\n` +
                     `Win Rate: **${Math.round(gottenProfile.games.competitive.win_rate)}%**`,
              inline: true
            },
            {
              name: 'Most Played Heroes',
              value: `__[QUICK PLAY]__\n` +
                     `1. **${gottenStats.stats.top_heroes.quickplay.played[0].hero}** - ${gottenStats.stats.top_heroes.quickplay.played[0].played}\n` +
                     `2. **${gottenStats.stats.top_heroes.quickplay.played[1].hero}** - ${gottenStats.stats.top_heroes.quickplay.played[1].played}\n` +
                     `3. **${gottenStats.stats.top_heroes.quickplay.played[2].hero}** - ${gottenStats.stats.top_heroes.quickplay.played[2].played}\n` +
                     `__[COMPETITIVE]__\n` +
                     `1. **${gottenStats.stats.top_heroes.competitive.played[0].hero}** - ${gottenStats.stats.top_heroes.competitive.played[0].played}\n` +
                     `2. **${gottenStats.stats.top_heroes.competitive.played[1].hero}** - ${gottenStats.stats.top_heroes.competitive.played[1].played}\n` +
                     `3. **${gottenStats.stats.top_heroes.competitive.played[2].hero}** - ${gottenStats.stats.top_heroes.competitive.played[2].played}`,
              inline: true
            }
          ]
        }});
      } else if (gottenProfile.private) {
        message.channel.send({embed: {
          color: 16751616,
          author: {
            name: 'OVERWATCH',
            icon_url: icons.ow_icon
          },
          title: 'Stats for ' + playerName,
          url: `https://playoverwatch.com/ja-jp/career/${platform}/${playerName.replace('#', '-')}`,
          description: `:no_entry_sign: **${gottenProfile.username}**はプロフィールを公開していません。\n` +
                       `詳細な統計を取得するには、ゲーム内設定からプロフィールの公開範囲を"Public"に変更してください。`,
          timestamp: new Date(),
          thumbnail: {
            url: gottenProfile.portrait
          },
          footer: {
            icon_url: message.client.user.avatarURL,
            text: '© nedew'
          },
          fields: [
            {
              name: 'Account Levels',
              value: `Level: **${gottenProfile.level}**\n` +
                     `Endorsement Level: **${gottenProfile.endorsement.level}**`
            }
          ]
        }}); 
      }
    
    }).catch(() => {
      console.log('Promise Error');
      message.reply('統計データ取得時にエラーが発生しました');
      return message.channel.send(owUsageMsg);
    });
  }
}
