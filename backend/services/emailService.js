const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT) || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('Configured SMTP Transporter.');
  } else {
    console.log('No SMTP configurations found. Creating a dynamic Ethereal test mail account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Ethereal test mail account created. User: ${testAccount.user}`);
    } catch (err) {
      console.warn('Failed to create Ethereal account. Using stub email sender.', err.message);
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('[STUB EMAIL] Sending mail:', mailOptions);
          return { messageId: 'stub-message-id' };
        }
      };
    }
  }
  return transporter;
}

const sendEmail = async ({ to, subject, html, text }) => {
  const mailTransporter = await getTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"TransitOps Alert" <noreply@transitops.com>',
    to,
    subject,
    text,
    html,
  };

  const info = await mailTransporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.messageId}`);
  
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Email Preview URL: ${previewUrl}`);
  }
  
  return {
    messageId: info.messageId,
    previewUrl,
  };
};

module.exports = {
  sendEmail,
};
