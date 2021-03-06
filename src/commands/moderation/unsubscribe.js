const { Command } = require('sylphy')

class Unsubscribe extends Command {
  constructor (...args) {
    super(...args, {
      name: 'unsubscribe',
      aliases: ['unsub'],
      description: 'Unsubscribes a channel from an event',
      usage: [{
        name: 'event',
        displayName: '<event 1>, [event 2]...',
        separator: ', ',
        type: 'list',
        optional: false,
        last: true,
        unique: true
      }],
      options: { guildOnly: true, localeKey: 'settings', botPerms: ['embedLinks'], modOnly: true },
      group: 'moderation'
    })
  }

  async handle ({ msg, args, client, settings }, responder) {
    const events = ['ban', 'kick', 'join', 'leave', 'nick', 'roles']
    const unknownEvent = args.event.find(e => !events.includes(e))
    if (unknownEvent) {
      return responder.error('{{subscribe.eventNotFound}}', {
        event: `**\`${unknownEvent}\`**`,
        events: events.map(e => `**\`${e}\`**`).join(', ')
      })
    }
    for (const event of args.event) {
      if (!settings.events) {
        settings.events = {}
      }
      if (!settings.events[event]) {
        settings.events[event] = []
      }
      settings.events[event].splice(settings.events[event].indexOf(event), 1)
    }
    try {
      await settings.save()
      return responder.success('{{subscribe.unsubSuccess}}', {
        channel: `**#${msg.channel.name}**`,
        events: args.event.map(e => `**\`${e}\`**`).join(', ')
      })
    } catch (err) {
      this.logger.error(
        `Error saving unsubscribed events for #${msg.channel.name} (${msg.channel.id}) ` +
        `in ${msg.channel.guild.name} (${msg.channel.guild.id})`,
        err
      )
      return responder.error()
    }
  }
}

module.exports = Unsubscribe
