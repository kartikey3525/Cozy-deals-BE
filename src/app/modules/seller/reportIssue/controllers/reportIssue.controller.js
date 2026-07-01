const {
  reportIssue,
  getReportIssue,
  reportIssueList,
  updateIssue,
} = require("../bussiness/reportIssue.bussiness");

exports.reportIssue = async (req) => await reportIssue(req.user, req.body);
exports.getReportIssue = async (req) => await getReportIssue(req.user);
exports.reportIssueList = async (req) => await reportIssueList(req.user);
exports.updateIssue = async (req) =>
  await updateIssue(req.user, req.query, req.body);
