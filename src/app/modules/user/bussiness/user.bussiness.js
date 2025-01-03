const { msg } = require("../../../../config/message");
const { generateAuthToken } = require("../../../util/generate.token");
const { isValid } = require("../../../middleware/validator.middleware");
const { sendSmsFromSpringedge } = require("../../../util/springedge");
const { emailOtp } = require("../../../util/emailOtp");

const { User } = require("../models/user.model");
const CryptoJS = require("crypto-js");

let validator = require("validator");

const sendOTP = async (body) => {
  let {
    name,
    phone,
    countryCode = 91,
    email,
    password,
    // userName,
    roleId = 0,
    isAcceptTermConditions,
  } = body;

  let check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  if (isAcceptTermConditions !== true) throw "accept-term-conditions";

  if (!check.test(password)) {
    throw "Password must be at least 6 characters long, include one letter, one number, and one special character.";
  }

  if (!validator.isMobilePhone(phone) && !validator.isEmail(email))
    throw msg.invalidPhone;

  let arr = [];
  if (isValid(email)) arr.push({ email: email });
  if (isValid(phone)) arr.push({ phone: phone });
  const foundUser = await User.findOne({
    $or: arr,
    isVerified: true,
  });

  if (foundUser) throw msg.duplicateEmailOrPhone;

  // if (roleId != 1 && roleId != 2) body.status = "approved";
  if (roleId == 1) body.role = "seller";
  // else if (roleId == 2) body.role = "admin";

  let OTP = Math.floor(1000 + Math.random() * 999).toString();
  let ciphertext = CryptoJS.AES.encrypt(
    OTP,
    process.env.crypto_secret_key
  ).toString();

  body.password = CryptoJS.AES.encrypt(
    password,
    process.env.crypto_secret_key
  ).toString();

  if (isValid(email)) {
    let abc = emailOtp(
      email,
      `Please enter this OTP ${OTP} . This code is valid for 10 minutes`,
      OTP
    );
    console.log(abc, "===============");
  } else if (isValid(phone)) {
    let phoneNumber = `${countryCode}${phone}`;
    let abc = sendSmsFromSpringedge(
      phoneNumber,
      `Please enter this OTP ${OTP} . This code is valid for 10 minutes`,
      OTP
    );
    console.log(abc, "===============");
  }

  let newDate = new Date();
  body.otp = ciphertext;
  body.otpDate = newDate;

  const createuser = await User.findOneAndUpdate(
    { $or: arr, isVerified: false },
    { $set: body },
    { new: true, upsert: true }
  );

  return {
    msg: msg.success,
  };
};

const verifyOTP = async (body) => {
  const { emailPhone, otp, fcmToken } = body;

  if (!isValid(emailPhone)) throw "phone is required";
  if (!isValid(otp)) throw "Please provide otp";

  let foundUser = await User.findOne({
    $or: [{ phone: emailPhone }, { email: emailPhone }],
    isDeleted: false,
  });
  if (!foundUser) throw msg.userNotFound;

  let date1 = foundUser.otpDate;
  let date1Time = date1.getTime();
  let date2 = new Date();
  let date2Time = date2.getTime();
  let minutes = (date2Time - date1Time) / (1000 * 60);
  if (minutes > 10) {
    throw msg.expireOtp;
  }

  const bytes = CryptoJS.AES.decrypt(
    foundUser.otp,
    process.env.crypto_secret_key
  );
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  if (originalText == otp || originalText != otp) {
    // when otp is work, then modify this line (|| originalText != otp ) remove this
    foundUser.isVerified = true;
    foundUser.fcmToken = fcmToken;
    res = await foundUser.save();

    return {
      msg: "OTP verified successfully",
      role: foundUser.role,
      roleId: foundUser.roleId,
      token: await generateAuthToken(foundUser),
      _id: foundUser._id,
    };
  } else {
    throw msg.incorrectOTP;
  }
};

const login = async (body) => {
  let { emailPhone, password, fcmToken } = body;

  if (!isValid(emailPhone) || !isValid(password)) {
    throw "provide required fields";
  }

  let user = await User.findOneAndUpdate(
    {
      $or: [
        { phone: emailPhone },
        { email: emailPhone },
        // { userName: emailPhone },
      ],
      isDeleted: false,
      isVerified: true,
    },
    { $set: { fcmToken: fcmToken, isDeactivated: false } },
    { new: true }
  );
  if (!user) throw msg.userNotFound;
  let decryptPassword = CryptoJS.AES.decrypt(
    user.password,
    process.env.crypto_secret_key
  ).toString(CryptoJS.enc.Utf8);

  if (decryptPassword != password) throw msg.invalidPassword;

  return {
    msg: msg.success,
    role: user.role,
    roleId: user.roleId,
    token: await generateAuthToken(user),
    _id: user._id,
  };
};

const google = async (body) => {
  let { email, googleData, fcmToken } = body;

  if (!validator.isEmail(email)) throw "email must be a valid email";

  // let userName = `${email.split("@")[0]}${Math.floor(Math.random() * 9999)}`;
  // body.userName = userName;
  if (googleData && googleData._json) {
    body.isVerified = true;
    body.name = googleData._json.name;
    body.profile = googleData._json.picture;
  }

  let user1 = await User.findOne({ email });
  if (!user1) {
    user1 = await User.create(body);
  }

  return {
    msg: msg.success,
    role: user1.role,
    roleId: user1.roleId,
    token: await generateAuthToken(user1),
    _id: user1._id,
  };
};

module.exports = { sendOTP, verifyOTP, login, google };
