"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDailyReminders = void 0;
const admin = __importStar(require("firebase-admin"));
const fonnteService_1 = require("./services/fonnteService");
// Message template variables
const CLINIC_NAME = 'Praktek Gigi Dan Mulut';
/**
 * Logic to send reminders for appointments scheduled for tomorrow.
 */
const sendDailyReminders = async (fonnteToken) => {
    const db = admin.firestore();
    // 1. Get tomorrow's date string (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    console.log(`Checking appointments for date: ${tomorrowStr}`);
    try {
        // 2. Query 'queues' collection for patients scheduled tomorrow
        // Note: Adjust the collection name if needed based on the project structure
        const snapshot = await db.collection('queues')
            .where('date', '==', tomorrowStr)
            .get();
        if (snapshot.empty) {
            console.log('No appointments found for tomorrow.');
            return;
        }
        console.log(`Found ${snapshot.size} appointments. Sending reminders...`);
        const results = [];
        for (const doc of snapshot.docs) {
            const patient = doc.data();
            const { name, phone, date, time } = patient;
            if (!phone) {
                console.warn(`Patient ${name} has no phone number. Skipping...`);
                continue;
            }
            // Format date for the message (ex: 2026-04-13 -> 13 April 2026)
            const formattedDate = new Date(date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            // Template Pesan Profesional
            const message = `Halo Bapak/Ibu ${name}, ini adalah pengingat otomatis dari ${CLINIC_NAME}. Jadwal pemeriksaan Anda adalah besok, ${formattedDate} pukul ${time}. Mohon datang 15 menit lebih awal untuk proses administrasi. Terima kasih.`;
            try {
                const res = await fonnteService_1.FonnteService.sendMessage(phone, message, fonnteToken);
                results.push({ id: doc.id, success: true, response: res });
            }
            catch (err) {
                console.error(`Failed to send reminder to ${name} (${phone}):`, err.message);
                results.push({ id: doc.id, success: false, error: err.message });
            }
        }
        return results;
    }
    catch (error) {
        console.error('Error in sendDailyReminders function:', error);
        throw error;
    }
};
exports.sendDailyReminders = sendDailyReminders;
//# sourceMappingURL=reminders.js.map