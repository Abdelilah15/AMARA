export const EMAIL_VERIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eeeeee;
    }
    .header h1 {
      color: #333A5C; /* Votre couleur thème */
      font-size: 24px;
      margin: 0;
    }
    .content {
      padding: 20px 0;
      text-align: center;
    }
    .content p {
      color: #555555;
      font-size: 16px;
      line-height: 1.6;
    }
    .otp-code {
      background: linear-gradient(to right, #3b82f6, #8b5cf6); /* Gradient Bleu-Violet */
      color: #ffffff;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      padding: 15px 30px;
      border-radius: 8px;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #aaaaaa;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue sur AMARA</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      <p>Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
      
      <div class="otp-code">{{otp}}</div>
      
      <p>Ce code expirera dans 15 minutes.</p>
      <p>Si vous n'avez pas demandé cette inscription, veuillez ignorer cet email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 AMARA. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation du mot de passe</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eeeeee;
    }
    .header h1 {
      color: #dc2626; /* Rouge pour indiquer une action sensible */
      font-size: 24px;
      margin: 0;
    }
    .content {
      padding: 20px 0;
      text-align: center;
    }
    .content p {
      color: #555555;
      font-size: 16px;
      line-height: 1.6;
    }
    .otp-code {
      background-color: #f3f4f6;
      color: #333333;
      border: 2px dashed #3b82f6;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      padding: 15px 30px;
      border-radius: 8px;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #aaaaaa;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Réinitialisation de mot de passe</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Voici votre code OTP :</p>
      
      <div class="otp-code">{{otp}}</div>
      
      <p>Utilisez ce code pour définir un nouveau mot de passe.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, sécurisez votre compte immédiatement.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 AMARA. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`;

export const EMAIL_CHANGE_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changement d'email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eeeeee;
    }
    .header h1 {
      color: #333A5C;
      font-size: 24px;
      margin: 0;
    }
    .content {
      padding: 20px 0;
      text-align: center;
    }
    .content p {
      color: #555555;
      font-size: 16px;
      line-height: 1.6;
    }
    .otp-code {
      background: linear-gradient(to right, #3b82f6, #8b5cf6);
      color: #ffffff;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      padding: 15px 30px;
      border-radius: 8px;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #aaaaaa;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vérification du nouvel email</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      <p>Vous avez demandé à changer votre adresse email sur AMARA. Veuillez utiliser le code ci-dessous pour confirmer cette modification :</p>
      
      <div class="otp-code">{{otp}}</div>
      
      <p>Ce code est valable pendant 15 minutes.</p>
      <p>Si vous n'avez pas initié ce changement, aucune action n'est requise de votre part.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 AMARA. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`;