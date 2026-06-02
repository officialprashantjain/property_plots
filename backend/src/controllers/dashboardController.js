const Property = require('../models/Property');
const Agent = require('../models/Agent');
const Contact = require('../models/Contact');

exports.getStats = async (req, res) => {
  try {
    const [totalProperties, totalAgents, totalInquiries, recentInquiries] = await Promise.all([
      Property.countDocuments(),
      Agent.countDocuments(),
      Contact.countDocuments(),
      Contact.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        totalProperties,
        totalAgents,
        totalInquiries,
        recentInquiries
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};
