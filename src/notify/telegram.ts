import { PrismaClient } from '@prisma/client'
import { Telegraf } from 'telegraf'
import { config } from '../config'

export class Telegram {
  private bot: Telegraf

  constructor(public prisma: PrismaClient) {
    this.bot = new Telegraf(config.BOT_TOKEN)

    this.bot.use(async (ctx, next) => {
      try {
        let { id } = ctx?.message?.from || {}

        let user = await this.prisma.user.findUnique({
          where: {
            tgId: id,
          },
        })

        if (!user) {
          return ctx.reply('You are not authorized to use this bot')
        }

        if (user.isActivated) {
          return ctx.reply(
            `Please contact @dennohpeter to activate your account.`,
          )
        } else {
          await next()
          return
        }
      } catch (error) {
        console.log(error)
      }
    })

    this.bot.start(async (ctx) => {
      return ctx.reply(
        `Hello ${
          ctx.from?.first_name || ctx?.from?.last_name || ctx?.from.first_name
        }, Welcome to ${ctx.me}`,
      )
    })

    this.bot.on('text', async (ctx) => {
      //   user && processUserInput(ctx, user)
    })
  }
}
