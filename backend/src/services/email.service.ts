import { CONSTANTS } from '@/config/constants';
import type { ContactInput } from '@/schemas/contact.schema';

// Note: This is a placeholder for email functionality
// You'll need to install and configure an email provider:
// - SendGrid: npm install @sendgrid/mail
// - Resend: npm install resend
// - Nodemailer: npm install nodemailer

export class EmailService {
  /**
   * Send contact form email
   */
  async sendContactEmail(data: ContactInput): Promise<void> {
    // TODO: Implement with your preferred email service
    // Example with SendGrid:
    /*
    import sgMail from '@sendgrid/mail';

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    const msg = {
      to: CONSTANTS.CONTACT_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL!,
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      text: `
        Name: ${data.name}
        Email: ${data.email}
        Subject: ${data.subject}

        Message:
        ${data.message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <h3>Message:</h3>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    };

    await sgMail.send(msg);
    */

    // For now, just log the contact form data
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Send welcome email to new user (optional)
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`Sending welcome email to ${email} (${name})`);
    // TODO: Implement welcome email
  }
}

export const emailService = new EmailService();
