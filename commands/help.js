const { prefix } = require('../config.json');

module.exports = {
  name: 'help',
  description: '使用可能なコマンドリスト',
  aliases: ['commands', 'command'],
  usage: '[command name]',
  cooldown: 4,
  execute(message, args) {
    const data = [];
    const { commands } = message.client;

    if (!args.length) {
      data.push('使用可能なコマンド一覧:');
      data.push(commands.map(command => command.name).join(', '));
      data.push(`\n\`${prefix}help [command name]\` で指定したコマンドの詳細を確認できます`);

      return message.author.send(data, { split: true })
        .then(() => {
          if (message.channel.type === 'dm') return;
          message.reply('DMにヘルプを送信しました');
        })
        .catch(error => {
          console.error(`${message.author.tag}へのDMの送信に失敗しました`);
          message.reply('DMを送信することが出来ませんでした。\n設定からDMが有効化されているか確認してください。');
        });
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply('無効なコマンドです');
    }

    data.push(`**Name:** ${command.name}`);

    if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
    if (command.description) data.push(`**Description:** ${command.description}`);
    if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

    data.push(`**Cooldown:** ${command.cooldown || 3} 秒`);

    message.channel.send(data, { split: true });

  }
}