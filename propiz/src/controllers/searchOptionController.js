const SearchOption = require("../models/SearchOption");

// @desc    Get all search options grouped by category
// @route   GET /api/search-options
// @access  Public
exports.getAllOptions = async (req, res) => {
  try {
    const options = await SearchOption.find({});

    // Group options by category to make it extremely easy for the frontend to render
    const formattedOptions = {
      propertyTypes: options.filter((opt) => opt.category === "propertyType"),
      locations: options.filter((opt) => opt.category === "location"),
      priceRanges: options.filter((opt) => opt.category === "priceRange"),
      plotSizes: options.filter((opt) => opt.category === "plotSize"),
    };

    res.status(200).json(formattedOptions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new search option
// @route   POST /api/search-options
// @access  Private/Admin
exports.createOption = async (req, res) => {
  try {
    const { category, value } = req.body;

    if (!category || !value) {
      return res
        .status(400)
        .json({ message: "Please provide both category and value" });
    }

    const option = await SearchOption.create({ category, value });
    res.status(201).json(option);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "This option already exists in this category" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a search option
// @route   PUT /api/search-options/:id
// @access  Private/Admin
exports.updateOption = async (req, res) => {
  try {
    const { value } = req.body;
    const option = await SearchOption.findById(req.params.id);

    if (!option) {
      return res.status(404).json({ message: "Search option not found" });
    }

    if (value) option.value = value;

    const updatedOption = await option.save();
    res.status(200).json(updatedOption);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This option already exists" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a search option
// @route   DELETE /api/search-options/:id
// @access  Private/Admin
exports.deleteOption = async (req, res) => {
  try {
    const option = await SearchOption.findById(req.params.id);

    if (!option) {
      return res.status(404).json({ message: "Search option not found" });
    }

    await option.deleteOne();
    res.status(200).json({ message: "Search option removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
