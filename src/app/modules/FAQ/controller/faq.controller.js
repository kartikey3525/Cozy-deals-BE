const FAQ = require("../model/faq.model");

// Get all FAQ questions
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.status(200).json(faqs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific FAQ by id
exports.getFAQById = async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json(faq);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new FAQ
exports.createFAQ = async (req, res) => {
  const { question, answer } = req.body;
  try {
    const newFAQ = new FAQ({
      question,
      answer,
    });
    await newFAQ.save();
    res.status(201).json(newFAQ);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update an existing FAQ
exports.updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { question, answer },
      { new: true }
    );
    if (!updatedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json(updatedFAQ);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an FAQ
exports.deleteFAQ = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedFAQ = await FAQ.findByIdAndDelete(id);
    if (!deletedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
