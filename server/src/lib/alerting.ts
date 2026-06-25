import { logger } from './logger';
import axios from 'axios';

// Example Webhook URLs
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const EMAIL_API_URL = process.env.EMAIL_API_URL;

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AlertPayload {
  title: string;
  message: string;
  severity: AlertSeverity;
  metadata?: any;
}

export const alertManager = {
  async send(payload: AlertPayload) {
    logger.info(`[Alert] ${payload.severity} - ${payload.title}: ${payload.message}`);

    // Critical alerts go everywhere (Slack, WhatsApp, Email)
    if (payload.severity === 'CRITICAL') {
      await Promise.all([
        this.notifySlack(payload),
        this.notifyWhatsApp(payload),
        this.notifyEmail(payload)
      ]);
    } else if (payload.severity === 'WARNING') {
      // Warnings only to Slack
      await this.notifySlack(payload);
    }
  },

  async notifySlack(payload: AlertPayload) {
    if (!SLACK_WEBHOOK_URL) return;
    try {
      await axios.post(SLACK_WEBHOOK_URL, {
        text: `*[${payload.severity}] ${payload.title}*\n${payload.message}\n\`\`\`${JSON.stringify(payload.metadata, null, 2)}\`\`\``
      });
    } catch (e) {
      logger.error('Failed to send Slack alert', e);
    }
  },

  async notifyWhatsApp(payload: AlertPayload) {
    if (!WHATSAPP_API_URL) return;
    // Example integration
    try {
      await axios.post(WHATSAPP_API_URL, {
        body: `[${payload.severity}] ${payload.title}\n${payload.message}`
      });
    } catch (e) {
      logger.error('Failed to send WhatsApp alert', e);
    }
  },

  async notifyEmail(payload: AlertPayload) {
    if (!EMAIL_API_URL) return;
    // Example integration
    try {
      await axios.post(EMAIL_API_URL, {
        subject: `[${payload.severity}] ${payload.title}`,
        body: payload.message
      });
    } catch (e) {
      logger.error('Failed to send Email alert', e);
    }
  }
};
