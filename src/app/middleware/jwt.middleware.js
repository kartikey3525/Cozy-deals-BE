const { User } = require("../modules/user/models/user.model");
const { msg } = require("../../config/message");
const { errorHandler } = require("../helpers/errorHandling.helper");
const jwt = require("jsonwebtoken");

const secret = process.env.secret_token;

/**
 * Verify JWT and return authenticated user
 * - Verifies token
 * - Checks user exists
 * - Checks user is not deleted
 * - Checks user is not deactivated
 */
const verifyUser = async token => {
  const decoded = jwt.verify(token, secret);

  const user = await User.findById(decoded._id);

  if (!user || user.isDeleted === true || user.isDeactivated === true) {
    throw msg.unauthorisedRequest;
  }

  return user;
};

/**
 * Seller Authentication
 */
exports.sellerAuthenticate = async (req, res, next) => {
  try {
    const auth = req.header("Authorization");

    if (!auth) throw msg.unauthorisedRequest;

    const token = auth.substring(auth.indexOf(" ") + 1);

    const user = await verifyUser(token);

    if (user.roleId !== 1) {
      throw msg.unauthorisedRequest;
    }

    user.id = user._id.toString();

    req.user = user;

    next();
  } catch (err) {
    const error = errorHandler(err, 401);
    return res.status(error.status).send(error);
  }
};

/**
 * Buyer Authentication
 */
exports.buyerAuthenticate = async (req, res, next) => {
  try {
    const auth = req.header("Authorization");

    if (!auth) throw msg.unauthorisedRequest;

    const token = auth.substring(auth.indexOf(" ") + 1);

    const user = await verifyUser(token);

    if (user.roleId !== 0) {
      throw msg.unauthorisedRequest;
    }

    user.id = user._id.toString();

    req.user = user;

    next();
  } catch (err) {
    const error = errorHandler(err, 401);
    return res.status(error.status).send(error);
  }
};

/**
 * Admin Authentication
 */
exports.adminAuthenticate = async (req, res, next) => {
  try {
    const auth = req.header("Authorization");

    if (!auth) throw msg.unauthorisedRequest;

    const token = auth.substring(auth.indexOf(" ") + 1);

    const user = await verifyUser(token);

    if (user.roleId !== 2) {
      throw msg.unauthorisedRequest;
    }

    user.id = user._id.toString();

    req.user = user;

    next();
  } catch (err) {
    const error = errorHandler(err, 401);
    return res.status(error.status).send(error);
  }
};

/**
 * General Authentication
 */
exports.authenticate = async (req, res, next) => {
  try {
    const auth = req.header("Authorization");

    if (!auth) throw msg.unauthorisedRequest;

    const token = auth.substring(auth.indexOf(" ") + 1);

    const user = await verifyUser(token);

    user.id = user._id.toString();

    req.user = user;

    next();
  } catch (err) {
    const error = errorHandler(err, 401);
    return res.status(error.status).send(error);
  }
};