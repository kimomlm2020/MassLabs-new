import nodemailer from 'nodemailer';

// Configuration du transporteur
const createTransporter = () => {
  // Gmail configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Mot de passe d'application Gmail
      }
    });
  }
  
  // Configuration SMTP personnalisée
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Envoyer l'email de réinitialisation
export const sendPasswordResetEmail = async (to, resetUrl, userName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Mass Labs" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: #d4af37; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #d4af37; color: #1a1a1a; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
          .link-box { background: #eee; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Mass Labs</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${userName},</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <center>
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </center>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <div class="link-box">${resetUrl}</div>
            
            <p style="color: #c00; margin-top: 20px;">
              <strong>⚠️ Ce lien expire dans 1 heure.</strong>
            </p>
            
            <div class="footer">
              <p>Si vous n'avez pas fait cette demande, ignorez simplement cet email.</p>
              <p>Mass Labs - Support Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Bonjour ${userName},

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur ce lien : ${resetUrl}

Ce lien expire dans 1 heure.

Si vous n'avez pas fait cette demande, ignorez cet email.`
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email envoyé:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw error;
  }
};

export default { sendPasswordResetEmail };