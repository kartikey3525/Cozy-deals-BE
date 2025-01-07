const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "priyankakridemo93@gmail.com",
    pass: "ozwb zicp cbny bpqx",
  },
});

exports.emailOtp = async (email, smsBody, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"service application 👻" <priyankakridemo93@gmail.com>', // sender address
      to: email, // "bar@example.com, baz@example.com", // list of receivers
      subject: "Otp for email verification", // Subject line
      text: smsBody, // plain text body
      html: `<b>${smsBody}</b>`, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return "ok";
  } catch (error) {
    console.log(error.message);
  }
};
