export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'ScholarPrep Support Form', email: 'hello@scholarprep.com.au' },
        to: [{ email: 'hello@scholarprep.com.au', name: 'ScholarPrep Support' }],
        replyTo: { email, name },
        subject: `Support: ${subject || 'New message'} — from ${name}`,
        htmlContent: `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F5F7FF;">

  <!-- Header -->
  <div style="background: #3730A3; padding: 28px 40px; text-align: center;">
    <div style="font-family: 'Plus Jakarta Sans', Georgia, sans-serif; font-size: 24px; font-weight: 900; color: #fff; letter-spacing: -0.5px;">
      Scholar<span style="color: #A5B4FC;">Prep</span>
    </div>
    <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px; letter-spacing: 0.1em; text-transform: uppercase;">
      Support Request
    </div>
  </div>

  <!-- Body -->
  <div style="padding: 36px 40px; background: #fff; margin: 20px; border-radius: 16px; border: 1px solid rgba(67,56,202,0.08); box-shadow: 0 4px 20px rgba(67,56,202,0.06);">
    <h2 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 20px; font-family: 'Plus Jakarta Sans', Georgia, sans-serif;">
      New support message
    </h2>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 10px 14px; background: #F8FAFF; border-radius: 8px 8px 0 0; border: 1px solid #EEF2FF; font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em;">From</td>
        <td style="padding: 10px 14px; background: #F8FAFF; border-radius: 8px 8px 0 0; border: 1px solid #EEF2FF; font-size: 14px; color: #111827;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border: 1px solid #EEF2FF; border-top: none; font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em;">Email</td>
        <td style="padding: 10px 14px; border: 1px solid #EEF2FF; border-top: none; font-size: 14px; color: #4338CA;"><a href="mailto:${email}" style="color: #4338CA; text-decoration: none;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; background: #F8FAFF; border: 1px solid #EEF2FF; border-top: none; border-radius: 0 0 8px 8px; font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em;">Subject</td>
        <td style="padding: 10px 14px; background: #F8FAFF; border: 1px solid #EEF2FF; border-top: none; border-radius: 0 0 8px 8px; font-size: 14px; color: #111827;">${subject || '(no subject)'}</td>
      </tr>
    </table>

    <div style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;">Message</div>
    <div style="background: #F8FAFF; border: 1px solid #EEF2FF; border-radius: 10px; padding: 18px 20px; font-size: 15px; color: #374151; line-height: 1.75; white-space: pre-wrap;">
      ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>

    <div style="margin-top: 24px; padding: 14px 18px; background: #EEF2FF; border-radius: 10px; font-size: 13px; color: #4338CA;">
      💡 Reply directly to this email to respond to ${name}.
    </div>
  </div>

  <!-- Footer -->
  <div style="padding: 16px 24px; text-align: center;">
    <div style="font-size: 12px; color: #9CA3AF; font-family: 'Inter', Arial, sans-serif;">
      ScholarPrep Support · <a href="https://www.scholarprep.com.au" style="color: #4338CA; text-decoration: none;">www.scholarprep.com.au</a>
    </div>
  </div>

</div>
        `
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Brevo support email error:', err);
      return res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }

    // Also send a confirmation to the user
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'ScholarPrep', email: 'hello@scholarprep.com.au' },
        to: [{ email, name }],
        subject: "We've received your message — ScholarPrep Support",
        htmlContent: `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F5F7FF;">
  <div style="background: #3730A3; padding: 28px 40px; text-align: center;">
    <div style="font-family: 'Plus Jakarta Sans', Georgia, sans-serif; font-size: 24px; font-weight: 900; color: #fff;">
      Scholar<span style="color: #A5B4FC;">Prep</span>
    </div>
  </div>
  <div style="padding: 36px 40px; background: #fff; margin: 20px; border-radius: 16px; border: 1px solid rgba(67,56,202,0.08);">
    <h2 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 14px; font-family: 'Plus Jakarta Sans', Georgia, sans-serif;">
      Thanks for getting in touch, ${name.split(' ')[0]}!
    </h2>
    <p style="font-size: 15px; color: #6B7280; line-height: 1.75; margin: 0 0 20px;">
      We've received your message and will get back to you as soon as possible — usually within 1–2 business days.
    </p>
    <div style="background: #F8FAFF; border: 1px solid #EEF2FF; border-radius: 10px; padding: 16px 20px; font-size: 14px; color: #374151; margin-bottom: 24px;">
      <strong>Your message:</strong><br/><br/>
      <span style="white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
    </div>
    <p style="font-size: 14px; color: #6B7280; line-height: 1.7; margin: 0;">
      In the meantime, you can <a href="https://www.scholarprep.com.au/app" style="color: #4338CA; font-weight: 600; text-decoration: none;">continue practising</a> or visit our app.
    </p>
  </div>
  <div style="padding: 16px 24px; text-align: center; font-size: 12px; color: #9CA3AF;">
    ScholarPrep · <a href="https://www.scholarprep.com.au" style="color: #4338CA; text-decoration: none;">www.scholarprep.com.au</a>
  </div>
</div>
        `
      })
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Support email error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
