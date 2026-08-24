import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, company, email, phone, description } = req.body;

  console.log("[CONTACT API] Initializing request via Resend...");
  console.log(`[CONTACT API] ENV Check - RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'SET' : 'MISSING'}`);

  if (!process.env.RESEND_API_KEY) {
     console.error("[CONTACT API ERROR] Missing RESEND_API_KEY in Vercel. Cannot send email.");
     return res.status(500).json({ message: 'Server configuration error (Missing Resend API Key).' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });

  const mailText = `Namn:
${name || '-'}

Företag:
${company || '-'}

E-post:
${email || '-'}

Telefon:
${phone || '-'}

Beskrivning:
${description || '-'}

Tidpunkt:
${timestamp}
`;

  try {
    console.log("[CONTACT API] Sending email via Resend API...");
    
    // Once the domain is verified in Resend, emails MUST be sent from that domain.
    const fromAddress = process.env.RESEND_FROM || 'no-reply@norrsyn.se';
    const toAddress = process.env.RESEND_TO || 'info@norrsyn.se';
    
    const { data, error } = await resend.emails.send({
      from: `Norrsyn Webb <${fromAddress}>`,
      to: toAddress,
      subject: 'Ny förfrågan från norrsyn.se',
      text: mailText,
      replyTo: email || undefined
    });

    if (error) {
       console.error(`[CONTACT API ERROR] Resend declined the email:`, error);
       return res.status(500).json({ message: 'Resend delivery failed', details: error.message });
    }

    console.log(`[CONTACT API] Email successfully delivered to ${toAddress} at ${timestamp}. Resend ID: ${data.id}`);
    return res.status(200).json({ message: 'Success' });
    
  } catch (error) {
    console.error(`[CONTACT API ERROR] Fatal crash while calling Resend at ${timestamp}:`);
    console.error(error);
    return res.status(500).json({ message: 'Fatal error sending email', details: error.message });
  }
}
