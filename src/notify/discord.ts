import { Client } from 'discord.js'
import EventEmitter from 'events'
import { config } from '../config'

export class Discord extends EventEmitter {
  private client: Client
  private ready: boolean
  private msgQueue: { text: string; chatId: string }[]

  constructor() {
    super()
    this.client = new Client({
      intents: 'DirectMessages',
    })
    this.client.login(config.TELEGRAM_BOT_TOKEN)
    this.ready = false
    this.msgQueue = []
  }

  init = (listenChatIdOnly = false) => {
    this.client.on('ready', () => {
      this.ready = true

      for (let i = 0; i < this.msgQueue.length; i++) {
        let msg = this.msgQueue[i]
        this.sendMessage(msg.chatId, msg.text)
      }
      this.msgQueue = []
    })
  }

  sendMessage = async (chatId: string, text: string) => {
    if (!this.ready) {
      this.msgQueue.push({ text, chatId })
      return
    }
    let user = await this.client.users.fetch(chatId)

    if (!user) {
      console.error(`User not found: ${chatId}`)
      return
    }

    user.send(text)
  }
}
