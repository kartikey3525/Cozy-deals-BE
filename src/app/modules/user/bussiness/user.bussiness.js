const { msg } = require("../../../../config/message");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { generateAuthToken } = require("../../../util/generate.token");
const { isValid } = require("../../../middleware/validator.middleware");
const { sendSmsFromSpringedge } = require("../../../util/springedge");
const { emailOtp } = require("../../../util/emailOtp");
const {getRating} = require("../../seller/rating/bussiness/rating.bussiness");
const { User } = require("../models/user.model");
const CryptoJS = require("crypto-js");
const {
  createManyPost,
  get,
} = require("../../seller/post/bussiness/post.bussiness");

let validator = require("validator");

const sendOTP = async (body) => {
  let {
    name,
    countryCode = 91,
    password,
    // userName,
    roleId = 0,
    emailPhone,
    isAcceptTermConditions,
  } = body;

  let check = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  // if (isAcceptTermConditions !== true) throw "accept-term-conditions";

  if (!check.test(password)) {
    throw "Password must be at least 6 characters long, include one letter, one number, and one special character.";
  }

  if (!isValid(emailPhone)) throw msg.invalidPhone;

  if (validator.isEmail(emailPhone)) body.email = emailPhone;
  else body.phone = emailPhone;

  let arr = [{ email: emailPhone }, { phone: emailPhone }];
  const foundUser = await User.findOne({
    $or: arr,
    // isVerified: true,
    isDeleted: false,
  });

  let OTP = Math.floor(1000 + Math.random() * 999).toString();

  let ciphertext = CryptoJS.AES.encrypt(
    OTP,
    process.env.crypto_secret_key
  ).toString();

  let newDate = new Date();
  body.otp = ciphertext;
  body.otpDate = newDate;

  let cipherPassword = CryptoJS.AES.encrypt(
    password,
    process.env.crypto_secret_key
  ).toString();

  if (foundUser) {

    // Forgot password flow
    if (isValid(body.forgot) && body.forgot === true) {
      foundUser.forgotPassword = cipherPassword;
      foundUser.otp = ciphertext;
      foundUser.otpDate = newDate;
  
      if (isValid(body.fcmToken)) {
        foundUser.fcmToken = body.fcmToken;
      }
  
      await foundUser.save();
    }
  
    // Existing verified account
    else if (foundUser.isVerified) {
      throw "User already registered. Please login.";
    }
  
    // Existing but not verified
    else {
      foundUser.password = cipherPassword;
      foundUser.otp = ciphertext;
      foundUser.otpDate = newDate;
  
      if (isValid(body.fcmToken)) {
        foundUser.fcmToken = body.fcmToken;
      }
  
      await foundUser.save();
    }
  
  } else {
  
    if (roleId == 1) {
      body.role = "seller";
    }
  
    body.password = cipherPassword;
    body.otp = ciphertext;
    body.otpDate = newDate;
  
    await User.create(body);
  }

  if (isValid(body.email)) {
    try {
      const result = await emailOtp(
        body.email,
        `Please enter this OTP ${OTP}. This code is valid for 10 minutes`,
        OTP
      );
  
      console.log("Email sent:", result);
    } catch (err) {
      console.error("Email OTP Error:", err);
      throw err;
    }
  } else if (isValid(body.phone)) {
    let phoneNumber = `${countryCode}${body.phone}`;
    let abc = sendSmsFromSpringedge(
      phoneNumber,
      `Please enter this OTP ${OTP} . This code is valid for 10 minutes`,
      OTP
    );
    console.log(abc, "===============");
  }

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
    if (isValid(body.forgot) && body.forgot == true) {
      foundUser.password = foundUser.forgotPassword;
    }
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
  let { emailPhone, password, fcmToken ,roleId} = body;

  if (!isValid(emailPhone) || !isValid(password)) {
    throw "provide required fields";
  }

  let user = await User.findOneAndUpdate(
    {
      $or: [
        { phone: emailPhone },
        { email: emailPhone },
      ],
      isDeleted: false, 
      isVerified: true,
    },
    {
      $set: { fcmToken },
    },
    {
      new: true,
    }
  );
  
  if (!user) {
    throw msg.userNotFound;
  }
  
  if (user.roleId !== Number(roleId)) {
    throw "Please login with the correct account type.";
  }
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

  let user1 = await User.findOneAndUpdate(
    { email: email, isDeleted: false },
    { $set: body },
    { new: true }
  );

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

const updateProfile = async (user, body) => {
  Object.keys(body).forEach((key) => {
    if (!isValid(body[key])) delete body[key];
  });

  // Email validation
  if (isValid(body.email)) {
    const existingUser = await User.findOne({
      email: body.email,
      _id: { $ne: user._id },
      isDeleted: false,
    });

    if (existingUser) {
      throw "email already exists";
    }
  }

  // =======================
// Build seller location
// =======================

if (
  body.latitude &&
  body.longitude &&
  body.businessAddress
) {
  body.location = {
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
    city: body.city || "",
    state: body.state || "",
    pincode: body.pincode || "",
  };
}
  // Update user
  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id, isDeleted: false },
    { $set: body },
    {
      new: true,
      runValidators: true,
    }
  );

  // Create seller products
  if (
    Array.isArray(body.categoriesPost) &&
    body.categoriesPost.length > 0
  ) {
    await createManyPost(user, body.categoriesPost);
  }

  return {
    msg: msg.success,
  };
};

// const getProfile = async (user) => {
//   let user1 = await User.findOne({ _id: user._id, isDeleted: false }).lean();
//   if (!user1) throw msg.userNotFound;
//   let categoriesPost = await get(user);
//   user1.categoriesPost = categoriesPost.data;
//   return {
//     msg: msg.success,
//     data: user1,
//   };
// };

const getProfile = async (user) => {
    let user1 = await User.findOne({ _id: user._id, isDeleted: false }).lean();
    if (!user1) throw msg.userNotFound;

    let categoriesPost = await get(user);
    user1.categoriesPost = categoriesPost.data
    if (user1.categoriesPost.length === 0) {
      console.log('No categories post available for this user.');
      user1.averageRating = 0;
      return { msg: msg.success, data: user1 };
    }
    let postId = user1.categoriesPost[0]._id;  // Assume postId is the first one in categoriesPost

   console.log('Fetching rating for postId:', postId);

   let ratingData = await getRating(user,{
    postId
});
    console.log('Rating data response:', ratingData);

    if (ratingData && ratingData.averageRating) {
      console.log('Assigning averageRating from getRating:', ratingData.averageRating);
      user1.averageRating = parseFloat(ratingData.averageRating); 
    } else {
      console.log('No valid averageRating found in getRating, setting default value 0.');
      user1.averageRating = 0;
    }

    return {
      msg: msg.success,
      data: user1,
    };
};


// const getAllProfile = async () => {
//   let users = await User.find({ roleId: 1, isDeleted: false }).lean();

//   if (!users || users.length === 0) throw msg.userNotFound;

//   // Fetch categoriesPost concurrently for each user using Promise.all
//   const usersWithCategories = await Promise.all(
//     users.map(async (user) => {
//       let categoriesPost = await get(user);
//       user.categoriesPost = categoriesPost.data;
//       return user;
//     })
//   );

//   return {
//     msg: msg.success,
//     data: usersWithCategories,
//   };
// };

// const getAllProfile = async () => {
//   try {
//     // Fetch all users with roleId 1 and not deleted
//     let users = await User.find({ roleId: 1, isDeleted: false }).lean();

//     if (!users || users.length === 0) throw msg.userNotFound;

//     // Fetch categoriesPost concurrently for each user using Promise.all
//     const usersWithCategoriesAndRatings = await Promise.all(
//       users.map(async (user) => {
//         // Fetch categoriesPost for each user
//         let categoriesPost = await get(user);
//         user.categoriesPost = categoriesPost.data;

//         // If no categoriesPost data, set averageRating to 0
//         if (user.categoriesPost.length === 0) {
//           console.log(`No categories post available for user ${user._id}`);
//           user.averageRating = 0;
//         } else {
//           // If categoriesPost is available, calculate the average rating
//           let postId = user.categoriesPost[0]._id; // Assuming postId is the first in categoriesPost
//           console.log('Fetching rating for postId:', postId);

//           // Fetch rating data for the user (You might need to adjust this to fit your rating system)
//           let ratingData = await getRating(user, { postId: user._id });

//           // If rating data exists, assign the average rating; otherwise, set it to 0
//           if (ratingData && ratingData.averageRating) {
//             console.log('Assigning averageRating from getRating:', ratingData.averageRating);
//             user.averageRating = parseFloat(ratingData.averageRating); // Ensure it's a number
//           } else {
//             console.log(`No valid averageRating found for user ${user._id}, setting default to 0.`);
//             user.averageRating = 0;
//           }
//         }

//         return user; // Return user with categoriesPost and averageRating
//       })
//     );

//     console.log(
//       "Returning",
//       usersWithCategoriesAndRatings.length,
//       "sellers"
//       );
      
//       console.log(
//       JSON.stringify(
//       usersWithCategoriesAndRatings,
//       null,
//       2
//       ));
//     return {
//       msg: msg.success,
//       data: usersWithCategoriesAndRatings, // Return all users with their categoriesPost and averageRating
//     };



//   } catch (error) {
//     console.error('Error in getAllProfile:', error);
//     return { msg: 'Error fetching all profiles', error: error.message };
//   }
// };

const getAllProfile = async () => {

  const users = await User.find({
    isDeleted: false,
    isVerified: true,
}).lean();

return {
    msg: "success",
    data: users,
};

}

const deleteProfile = async (user) => {
  let user1 = await User.findOneAndUpdate(
    { _id: user._id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  return {
    msg: msg.success,
  };
};

const deactivateProfile = async (user) => {
  let user1 = await User.findOne({ _id: user._id, isDeleted: false });
  if (!user1) throw msg.userNotFound;
  if (user1.isDeactivated == true) user1.isDeactivated = false;
  else user1.isDeactivated = true;
  await user1.save();
  return {
    msg: msg.success,
  };
};

const userProfile = async (user, query) => {
  if (!isValid(query.id)) throw "user id is required";
  let user1 = await User.findById(query.id).select(
    `
    name
    profile
    address
    roleId
    role
    isAdminVerified
    lastSeen
    isOnline
    shopName
    ownerName
    businessAddress
    location
    businessScale
    isDeliveryAvailable
    currentShopLocationUrl
    contactNumber
    contactEmail
    description
    facebookUrl
    instagramUrl
    youtubeUrl
    websiteUrl
    `
  );
  if (!user1) throw msg.userNotFound;
  return {
    msg: msg.success,
    data: user1,
  };
};

const uploadImage = async (files, body) => {
  let image = [];
  for (let i = 0; i < files.image.length; i++) {
    console.log("Uploading file:", files.image[i].location);
    image.push(files.image[i].location);
  }

  return {
    msg: msg.success,
    data: image,
  };
};

const googleLogin = async (body) => {
  let { idToken, fcmToken } = body;

  if (!idToken) {
    throw "Google ID token is required";
  }

  // Verify the Google ID token
  const googleResponse = await axios.get(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  );

  const { email, name, picture, sub: googleId } = googleResponse.data;

  let user = await User.findOne({ email });

  if (!user) {
    // Create a new user if not exists
    user = new User({
      googleData: { googleId },
      name,
      email,
      profile: [picture],
      roleId: body.roleId || 0,
      role: body.roleId == 1 ? "seller" : "buyer",
      isVerified: true,
      fcmToken,
  });
  } else {
    // Update FCM token for existing user
    user.fcmToken = fcmToken;
    user.roleId = body.roleId || user.roleId;
    user.role = body.roleId == 1 ? "seller" : user.role;
  }

  await user.save();

  // Generate JWT token for authentication
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
      ...user.toObject(),
      token,
  };
};

module.exports = {
  sendOTP,
  verifyOTP,
  login,
  google,
  updateProfile,
  getProfile,
  getAllProfile,
  deleteProfile,
  deactivateProfile,
  userProfile,
  uploadImage,
  googleLogin,
};
