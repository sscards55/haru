const { Command } = require('sylphy')

class Lang extends Command {
  constructor (...args) {
    super(...args, {
      name: 'lang',
      description: 'Allows moderators to set a guild\'s language',
      aliases: ['locale'],
      usage: [{
        name: 'lang',
        type: 'string',
        optional: false,
        choices: [
          'en', 'pt', 'nl', 'ro', 'bg', 'de', 'fr', 'it', 'zh', 'es', 'tr', 'ru'
        ]
      }],
      options: { guildOnly: true, localeKey: 'settings', modOnly: true },
      group: 'moderation'
    })
  }

  async handle ({ msg, args, settings }, responder) {
    try {
      settings.lang = args.lang
      await settings.save()
      return responder.success('{{lang.success}}', {
        lang: `**\`${args.lang}\`**`
      })
    } catch (err) {
      this.logger.error(`Could not change language to '${args.lang}' for ${msg.channel.guild.name} (${msg.channel.guild.id})`, err)
      return responder.error()
    }
  }
}

module.exports = Lang
