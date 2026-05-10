/**
 * Se hizo una carpeta utils que se usa para guardar funciones reutilizables que no 
 * dependen de controladores ni modelos.
 * Aquí centralizamos la lógica de envío de correos para no repetir código en cada 
 * controlador.
 */

const nodemailer = require("nodemailer");

// Transporter configurado (puedes usar Gmail u otro servicio SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, // correo
    pass: process.env.EMAIL_PASS, // contraseña/app password
  },
});

/**
 * Envía un correo electrónico
 * @param {string} to - destinatario
 * @param {string} subject - asunto
 * @param {string} html - contenido en HTML
 */
async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"MVPI Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email enviado a ${to}`);
  } catch (err) {
    console.error("Error enviando correo:", err);
    throw err;
  }
}

module.exports = { sendMail };
