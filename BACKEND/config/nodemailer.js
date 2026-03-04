const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or configured host
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper function to send emails
const sendEmail = async ({ to, subject, html }) => {
    try {
        const brandedHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #0d9488, #4f46e5); padding: 24px; text-align: center; }
                    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
                    .content { padding: 32px; font-size: 16px; line-height: 1.6; color: #d1d5db; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; background-color: #030712; }
                    .btn { display: inline-block; padding: 12px 24px; background-color: #14b8a6; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>MaaCare</h1>
                    </div>
                    <div class="content">
                        ${html}
                    </div>
                    <div class="footer">
                        © ${new Date().getFullYear()} MaaCare. All rights reserved.<br>
                        AI-Powered Maternal Healthcare — India
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `"MaaCare Platform" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: brandedHtml,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send email');
    }
};

module.exports = sendEmail;
