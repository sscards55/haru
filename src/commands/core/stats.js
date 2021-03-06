const moment = require('moment')
const { Command, utils } = require('sylphy')

class Stats extends Command {
  constructor (...args) {
    super(...args, {
      name: 'stats',
      description: 'Statistics about me',
      options: { botPerms: ['embedLinks'] },
      group: 'core'
    })
  }

  async handle ({ msg, settings, client }, responder) {
    try {
      var results = await client.plugins.get('ipc').awaitResponse('stats')
    } catch (err) {
      this.logger.error('Could not fetch stats', err)
      return responder.error()
    }
    let stats = {
      u: [],
      g: [],
      tc: 0,
      vc: 0
    }
    results.forEach(elem => {
      stats.tc += elem.tc
      stats.vc += elem.vc
      stats.u = stats.u.concat(elem.us)
      stats.g = stats.g.concat(elem.gs)
    })
    return responder.embed({
      author: {
        name: 'pyraxo#6400',
        url: 'https://pyraxo.moe/haru',
        icon_url: 'https://twitter.com/pyraxo/profile_image?size=original'
      },
      description: [
        `**[${responder.t('{{server}}')}](https://discord.gg/vYMRRZF)**`
      ].join('\n'),
      color: utils.getColour('pink'),
      fields: [
        {
          name: responder.t('{{users}}'),
          value: [...new Set(stats.u)].length,
          inline: true
        },
        {
          name: responder.t('{{channels}}'),
          /*
          value: [
            `${stats.vc + stats.tc} ${responder.t('{{total}}')}`,
            `${stats.tc} ${responder.t('{{text}}')}`,
            `${stats.vc} ${responder.t('{{voice}}')}`
          ].join('\n'),
          */
          value: stats.vc + stats.tc,
          inline: true
        },
        {
          name: responder.t('{{guilds}}'),
          value: [...new Set(stats.g)].length,
          inline: true
        },
        {
          name: responder.t('{{uptime}}'),
          value: moment.duration(client.uptime, 'milliseconds').format('h[h] m[m] s[s]'),
          inline: true
        },
        {
          name: responder.t('{{memoryUsage}}'),
          value: (process.memoryUsage().heapUsed / 1000000).toFixed(2) + ' MB',
          inline: true
        },
        {
          name: responder.t('{{commandsUsed}}'),
          value: (await client.plugins.get('cache').client.hgetAsync('usage', 'ALL') || '0'),
          inline: true
        }
      ]
    }).send()
  }
}

module.exports = Stats
