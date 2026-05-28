const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'propertyadmin@gmail.com' });
    
    if (!adminExists) {
      await Admin.create({
        email: 'propertyadmin@gmail.com',
        password: 'Admin123',
        role: 'admin'
      });
      console.log('Seed: Initial admin user created successfully.');
    }
  } catch (error) {
    if (error.code === 11000) return;
    console.error('Error seeding admin user:', error);
  }
};

module.exports = seedAdmin;
