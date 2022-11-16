import { Client } from 'discord.js'
import { config } from '../config'

export class Discord {
  private client: Client

  constructor() {
    this.client = new Client({
      intents: 'DirectMessages',
    })
  }

  async send(userId: string, message: string) {
    await this.client.login(config.DISCORD_TOKEN)
    let user = await this.client.users.fetch(userId)

    if (!user) {
      console.error(`User not found: ${userId}`)
      return
    }

    user.send(message)
  }
}
