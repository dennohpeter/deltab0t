import 'dotenv/config'

if (
  !process.env.TELEGRAM_BOT_TOKEN &&
  !process.env.DISCORD_BOT_TOKEN &&
  !process.env.DATABASE_URL &&
  !process.env.JWT_SECRET
) {
  throw new Error(
    'TELEGRAM_BOT_TOKEN, DISCORD_BOT_TOKEN, DATABASE_URL && JWT_SECRET are required and must be set in .env file',
  )
}

export const config = {
  /**
   * Telegram bot token
   */
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,

  /**
   * DISCORD bot token
   */
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN!,

  /**
   * MAX RETRIES
   * Maximum number of retries for a request.
   * @type {number}
   */
  MAX_RETRIES: 50,

  /**
   * DATABASE_URL
   */
  DATABASE_URL: process.env.DATABASE_URL!,

  /**
   * @notice JWT configuration
   * @dev This is the secret key that will be used to sign the JWT
   */
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 24 * 7, // 7 days
}
