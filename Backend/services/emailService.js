const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configurar transporter con variables de entorno
let transporter;
let logoBase64;

const loadLogo = () => {
  if (logoBase64) return logoBase64;
  
  try {
    const logoPath = path.join(__dirname, '../../../Frontend/public/images/Coding-404-logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = 'data:image/png;base64,' + logoBuffer.toString('base64');
    return logoBase64;
  } catch (error) {
    return null;
  }
};

const initTransporter = () => {
  if (transporter) return transporter;
  
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    connectionTimeout: 10000,
    socketTimeout: 10000
  });
  
  return transporter;
};

const sendWelcomeEmail = async (user) => {
  try {
    // Validar que tenemos las credenciales del email configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return true;
    }

    // Cargar el logo en Base64
    const logo = loadLogo();
    const logoSrc = logo || 'https://raw.githubusercontent.com/tu-usuario/coding404/main/Frontend/public/images/Coding-404-logo.png';

    const transporter = initTransporter();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(180deg, #1f3cff 0%, #2c49ff 100%);
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(180deg, #1f3cff 0%, #2c49ff 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            width: 200px;
            height: auto;
            margin: 0 auto;
          }
          .content {
            padding: 40px 30px;
            color: #333;
          }
          .welcome-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f3cff;
            margin-bottom: 20px;
            text-align: center;
          }
          .welcome-text {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 30px;
            text-align: center;
          }
          .credentials-section {
            background: #f5f7ff;
            border-left: 4px solid #1f3cff;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
          }
          .credentials-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f3cff;
            text-transform: uppercase;
            margin-bottom: 15px;
            letter-spacing: 0.5px;
          }
          .credential-item {
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e0e5ff;
          }
          .credential-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .credential-label {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .credential-value {
            font-size: 16px;
            font-weight: 600;
            color: #1f3cff;
            font-family: 'Courier New', monospace;
            word-break: break-all;
          }
          .info-text {
            font-size: 14px;
            color: #777;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            line-height: 1.6;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #1f3cff 0%, #2c49ff 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
            transition: transform 0.2s ease;
          }
          .button:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoSrc}" alt="Coding 404" style="max-width: 300px; height: auto;">
          </div>
          
          <div class="content">
            <div class="welcome-title">¡Bienvenido, ${user.fullName}! 🎉</div>
            
            <p class="welcome-text">
              Te has registrado exitosamente en <strong>Coding 404</strong>. Estamos emocionados de tenerte en nuestra comunidad de programadores en formación.
            </p>

            <div class="credentials-section">
              <div class="credentials-title">Tus Credenciales de Acceso</div>
              
              <div class="credential-item">
                <div class="credential-label">Usuario</div>
                <div class="credential-value">${user.username}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Correo Electrónico</div>
                <div class="credential-value">${user.email}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Contraseña</div>
                <div class="credential-value">${user.password}</div>
              </div>
            </div>

            <p style="text-align: center; margin-bottom: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
                Ir a Iniciar Sesión
              </a>
            </p>

            <div class="info-text">
              <strong>💡 Consejo de Seguridad:</strong><br>
              Nunca compartas tus credenciales con nadie. Guarda este correo en un lugar seguro.
            </div>
          </div>

          <div class="footer">
            <p>© 2026 Coding 404. Todos los derechos reservados.</p>
            <p>Si no creaste esta cuenta, ignora este correo.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `¡Bienvenido a Coding 404, ${user.fullName}!`,
      html: htmlTemplate
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    // Errores comunes y soluciones
    if (error.code === 'EAUTH') {
      console.error('   → Problema: Credenciales inválidas');
      console.error('   → Solución: Verifica EMAIL_USER y EMAIL_PASSWORD en .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   → Problema: Servidor SMTP no responde');
      console.error('   → Solución: Verifica tu conexión a internet');
    } else if (error.code === 'ESOCKET') {
      console.error('   → Problema: Timeout de conexión');
      console.error('   → Solución: El servidor está lento o el firewall lo bloquea');
    }
    
    // No lanzar error para no afectar el flujo de registro
    return false;
  }
};

module.exports = {
  sendWelcomeEmail
};

