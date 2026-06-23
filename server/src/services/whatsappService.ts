import axios from 'axios';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'MOCK_TOKEN';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || 'MOCK_ID';
const API_VERSION = 'v17.0';

export const sendWhatsApp = async (to: string, templateName: string, languageCode = 'en') => {
  try {
    if (META_ACCESS_TOKEN === 'MOCK_TOKEN') {
      console.log(`[WhatsApp Mock] Sending template '${templateName}' to ${to}`);
      return { status: 'mock_delivered', to, templateName };
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${WHATSAPP_PHONE_ID}/messages`;
    
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log(`[WhatsApp] Message sent successfully to ${to}`);
    return response.data;
  } catch (error) {
    console.error(`[WhatsApp Error] Failed to send message to ${to}`, error);
    throw error;
  }
};
