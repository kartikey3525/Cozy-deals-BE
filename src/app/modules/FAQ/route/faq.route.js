const express = require("express");
const faqController = require("../controller/faq.controller");

const router = express.Router();

// Define the routes
router.get("/getFaqs", faqController.getAllFAQs);
router.get("/getFaqs/:id", faqController.getFAQById);
router.post("", faqController.createFAQ);
router.put("/updateFaq/:id", faqController.updateFAQ);
router.delete("/faq/:id", faqController.deleteFAQ);

module.exports = router;
