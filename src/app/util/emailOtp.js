const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "kartikeykapoor25@gmail.com",
    pass: "fwas hncy ltby brou",
  },
});

exports.emailOtp = async (email, smsBody, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"service application 👻" <kartikeykapoor25@gmail.com>', // sender address
      to: email, // "bar@example.com, baz@example.com", // list of receivers
      subject: "Otp for email verification", // Subject line
      text: smsBody, // plain text body
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .email-header {
      background-color: #007bff;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .email-header img {
  max-width: 100%; /* Ensures the image does not exceed the container's width */
  height: 50%;    /* Maintains the aspect ratio of the image */
  display: block;  /* Prevents inline spacing issues in some email clients */
  margin: 0 auto;  /* Centers the image horizontally */
    }
    .email-body {
      padding: 20px;
      text-align: center;
    }
    .email-body h1 {
      font-size: 24px;
      color: #333333;
    }
    .email-body p {
      font-size: 16px;
      color: #555555;
      line-height: 1.5;
    }
    .otp-code {
      display: inline-block;
      font-size: 28px;
      font-weight: bold;
      color: #007bff;
      background: #f0f8ff;
      padding: 10px 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .email-footer {
      background-color: #f9f9f9;
      color: #777777;
      text-align: center;
      padding: 15px;
      font-size: 14px;
    }
    .email-footer a {
      color: #007bff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Email Header -->
    <div class="email-header">
      <a href="https://bharatdigital.co/" target="_blank">
        <img src="https://st2.depositphotos.com/4035913/6124/i/450/depositphotos_61243733-stock-illustration-business-company-logo.jpg" alt="Your Company Logo">
      </a>
    </div>

    <!-- Email Body -->
    <div class="email-body">
      <h1>Here is your OTP</h1>
      <p>${smsBody}</p>
      <div class="otp-code">${otp}</div>
      <p>If you didn't request this, please ignore this email or contact support.</p>
    </div>

    <!-- Email Footer -->
    <div class="email-footer">
      <p>Need help? <a href="https://bharatdigital.co/contact/" target="_blank">Contact Support</a></p>
      <p>&copy; 2025 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return "ok";
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
};
