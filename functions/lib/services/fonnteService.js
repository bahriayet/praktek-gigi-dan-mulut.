"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FonnteService = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Service to handle WhatsApp messaging via Fonnte API.
 * You can get your Token from https://fonnte.com/
 */
class FonnteService {
    /**
     * Sends a WhatsApp message using Fonnte API.
     * @param target The recipient's phone number (ex: 62812345678)
     * @param message The message content
     * @param token The Fonnte API Token
     */
    static async sendMessage(target, message, token) {
        try {
            // Ensure phone number format is correct (starting with 62 or +62)
            let formattedTarget = target.replace(/[^0-9]/g, '');
            if (formattedTarget.startsWith('0')) {
                formattedTarget = '62' + formattedTarget.slice(1);
            }
            else if (formattedTarget.startsWith('8')) {
                formattedTarget = '62' + formattedTarget;
            }
            console.log(`Sending WhatsApp to ${formattedTarget}...`);
            const response = await axios_1.default.post(this.API_URL, {
                target: formattedTarget,
                message: message,
                delay: '2', // Delay to avoid spam detection
                countryCode: '62' // Indonesia
            }, {
                headers: {
                    Authorization: token
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error sending WhatsApp via Fonnte:', error?.response?.data || error.message);
            throw error;
        }
    }
}
exports.FonnteService = FonnteService;
FonnteService.API_URL = 'https://api.fonnte.com/send';
//# sourceMappingURL=fonnteService.js.map