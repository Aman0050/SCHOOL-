import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_MOCK_SID';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'MOCK_TOKEN';
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Initialize but handle the mock case safely
const client = twilio(accountSid, authToken, {
  lazyLoading: true, // Don't throw immediately if credentials are bad
});

export const sendSMS = async (to: string, body: string) => {
  try {
    if (accountSid === 'AC_MOCK_SID') {
      console.log(`[Twilio Mock] Sending SMS to ${to}: ${body}`);
      return { status: 'mock_delivered', to, body };
    }

    const message = await client.messages.create({
      body,
      from: twilioNumber,
      to,
    });
    
    console.log(`[Twilio] SMS sent successfully. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`[Twilio Error] Failed to send SMS to ${to}`, error);
    throw error;
  }
};
