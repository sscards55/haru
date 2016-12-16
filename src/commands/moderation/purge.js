const logger = require('winston')
const { Command } = require('../../core')

class Purge extends Command {
  constructor (...args) {
    super(...args, {
      name: 'purge',
      description: 'Bulk delete messages from a channel',
      usage: [
        { name: 'amount', type: 'int', optional: false },
        {
          name: 'options',
          displayName: 'keyword | bots | @user | embeds | files | links | images | commands',
          type: 'list',
          separator: ' | ',
          optional: true
        }
      ],
      options: { guildOnly: true, permissions: ['manageGuild'] }
    })
  }

  createFilter (val, settings) {
    switch (val) {
      case 'bots': return (msg) => msg.author.bot
      case 'embeds': return (msg) => msg.embeds.length
      case 'files': return (msg) => msg.attachments.length
      case 'images': return (msg) => msg.attachments.length + msg.embeds.length
      case 'links': return (msg) => /https?:\/\/[^ ]*(?:.\w+(?:\/(?:[^ ]*)?)?)$/.test(msg.content)
      case 'commands': return (msg) => msg.content.startsWith(settings.prefix) ||
      msg.content.startsWith(process.env.CLIENT_PREFIX)
      default: {
        const isMember = val.match(/^<@!?(\d{17,18})>$/) || val.match(/^(\d{17,18})$/)
        if (isMember) return (msg) => msg.author.id === isMember[1]
        return (msg) => msg.cleanContent.includes(val)
      }
    }
  }

  async handle ({ msg, args, data, settings, client }, responder) {
    let success = 0
    const opts = Array.isArray(args.options) ? args.options : [args.options]
    try {
      const res = await (
        args.options
        ? msg.channel.purge(1000, msg => {
          if (success >= args.amount) return false
          for (const filter of opts.map(this.createFilter, settings)) {
            if (filter(msg)) {
              success++
              return true
            }
          }
        })
        : msg.channel.purge(args.amount)
      )
      return responder.success(args.options ? '{{filterSuccess}}' : '{{success}}', {
        num: `**${res}**`,
        criteria: args.options ? opts.map(v => {
          const isMember = v.match(/^<@!?(\d{17,18})>$/) || v.match(/^(\d{17,18})$/)
          if (isMember) {
            const user = client.users.get(isMember[1])
            return `\`@${user ? user.username : 'user'}\``
          }
          if (!['bots', 'embeds', 'files', 'images', 'links', 'commands'].includes(v)) {
            return `\`keyword "${v}"\``
          }
          return `\`${v}\``
        }).join(', ') : null
      })
    } catch (err) {
      logger.error(`Could not purge ${args.amount} messages from #${msg.channel.name} (${msg.channel.id}) in ${msg.guild.name} (${msg.guild.id})`)
      logger.error(err)
      return responder.error()
    }
  }
}

module.exports = Purge