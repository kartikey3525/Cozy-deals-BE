const mongoose = require("mongoose");
const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { ReportIssue } = require("../models/reportIssue.model");

const reportIssue = async (user, body) => {
  body.userId = user._id;
  const issue = await ReportIssue.create(body);

  return {
    msg: msg.success,
  };
};

const getReportIssue = async (user) => {
  const issue = await ReportIssue.find({ userId: user._id }).sort({
    updatedAt: -1,
  });

  return {
    msg: msg.success,
    count: issue.length,
    data: issue,
  };
};

const reportIssueList = async (user) => {
  const issue = await ReportIssue.find().sort({
    updatedAt: -1,
  });

  return {
    msg: msg.success,
    count: issue.length,
    data: issue,
  };
};

const updateIssue = async (user, query, body) => {
  if (!isValid(query.id)) throw "invalid id";
  Object.keys(body).forEach((key) => {
    if (!isValid(body[key])) delete body[key];
  });
  const issue = await ReportIssue.updateOne(
    { _id: query.id },
    { $set: body }
  ).sort({
    updatedAt: -1,
  });

  return {
    msg: msg.success,
  };
};

module.exports = {
  reportIssue,
  getReportIssue,
  reportIssueList,
  updateIssue,
};
