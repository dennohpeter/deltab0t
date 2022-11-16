import axios from 'axios'

export class SMS {
  async send(to: string, message: string) {
    try {
      const { data } = await axios({
        method: 'post',
        url: 'https://quicksms.advantasms.com/api/services/sendsms/',
        data: {
          apiKey: process.env.ADVANTA_API_KEY,
          partnerID: process.env.ADVANTA_PARTNER_ID,
          message,
          shortcode: process.env.ADVANTA_SHORTCODE,
          mobile: to,
        },
      })

      let {
        responses,
      }: {
        responses: {
          'respose-code': number
          'response-description': string
          mobile: string
          messageid: number
          clientsmsid: string
          networkid: string
        }[]
      } = data

      console.log(data)

      return {
        success: true,
        data: responses,
      }
    } catch (error) {
      console.log(error)
      return {
        error,
        success: false,
      }
    }
  }
}
