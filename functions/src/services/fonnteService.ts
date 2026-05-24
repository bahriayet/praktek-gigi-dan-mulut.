import axios from 'axios';

/**
 * Service to handle WhatsApp messaging via Fonnte API.
 * You can get your Token from https://fonnte.com/
 */
export class FonnteService {
  private static API_URL = 'https://api.fonnte.com/send';

  /**
   * Sends a WhatsApp message using Fonnte API.
   * @param target The recipient's phone number (ex: 62812345678)
   * @param message The message content
   * @param token The Fonnte API Token
   */
  static async sendMessage(target: string, message: string, token: string): Promise<any> {
    try {
      // Ensure phone number format is correct (starting with 62 or +62)
      let formattedTarget = target.replace(/[^0-9]/g, '');
      if (formattedTarget.startsWith('0')) {
        formattedTarget = '62' + formattedTarget.slice(1);
      } else if (formattedTarget.startsWith('8')) {
        formattedTarget = '62' + formattedTarget;
      }

      console.log(`Sending WhatsApp to ${formattedTarget}...`);

      const response = await axios.post(
        this.API_URL,
        {
          target: formattedTarget,
          message: message,
          delay: '2', // Delay to avoid spam detection
          countryCode: '62' // Indonesia
        },
        {
          headers: {
            Authorization: token
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error sending WhatsApp via Fonnte:', error?.response?.data || error.message);
      throw error;
    }
  }
}
