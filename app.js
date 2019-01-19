'use strict';
const fs = require('fs');
const Discord = require('discord.js');

// app.jsから扱いたい関数を記述しているファイルの読み込み
const func = require('./js/functions');
// configファイルから読み込み
const { prefix, token } = require('./config.json');

// discord インスタンス作成
const client = new Discord.Client();
// 全てのコマンドを格納するオブジェクト
client.commands = new Discord.Collection();

// ./commandsフォルダ内の.jsファイルのみを抽出
const commandFile = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// 名にコマンド名、値にモジュールの読み込みを持つプロパティをセットしていく
commandFile.forEach(file => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

// コマンド毎のクールダウンタイムを持つオブジェクト
const cooldowns = new Discord.Collection();

// ready!!!
client.once('ready', () => {
  console.log('ready!');

  // functions.jsにある処理を実行
  func.confirmationMcServerStatus(client);
});


// BOTが居るチャンネルにメッセージが発せられた時
client.on('message', message => {

  // Bot自身の発言を無視
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // スペースで分割した後コマンド名部分のみ抽出
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  // ユーザの入力したコマンドの照合 - aliasesで設定されているものでも可
  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  // guildOnly === true なコマンドがDM上で実行されることを拒否
  if (command.guildOnly && message.channel.type !== 'text')
    return message.reply('ダイレクトメッセージ上ではこのコマンドは実行できません');

  // 特定のユーザ専用のコマンド(specificUserOnly === true)が非対象のユーザに実行されることを阻止
  if (command.specificUserOnly && message.author.id !== command.specificUserOnly)
    return message.reply('このコマンドは特定のユーザのみ実行可能です');

  // args === true なコマンドが引数無しで実行されることを防ぐ
  if (command.args && !args.length) {
    let reply = 'そのコマンドの実行に必要な値が入力されていません';

    // usageが設定されている場合はその内容も追加
    if (command.usage) reply += `\n使用方法: \`${prefix}${command.name} ${command.usage}`;
    
    return message.channel.send(reply);
  }

  // Bot起動後初めて実行されたコマンドであればオブジェクトを作成
  if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection);

  // クールダウンの処理に必要な変数宣言
  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  // 特定のコマンドが入力された時、入力したユーザのIDが記録されていれば(前回のコマンド実行時からクールダウン時間を経過していなければ)その旨を返し終了させる
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`${command.name}コマンドは${timeLeft.toFixed(1)}秒後に利用可能です`);
    }
  }

  // コマンドを実行しようとしたユーザIDを今の時間と共に記録
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  // コマンドの実行
  try{
    command.execute(message, args);
  }
  catch (error) {
    console.error(error);
    message.reply('コマンドの実行に失敗しました');
  }

})

// Connection to Discord
client.login(token);