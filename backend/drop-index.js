const mongoose = require('mongoose');

const dropIndex = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/propiz_local_db');
        console.log("Connected to DB");
        await mongoose.connection.db.collection('properties').dropIndex("slug_1");
        console.log("Successfully dropped the unique 'slug' index!");
    } catch (err) {
        console.log("Index might not exist or another error occurred:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

dropIndex();
