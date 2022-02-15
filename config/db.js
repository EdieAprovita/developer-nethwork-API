const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.DB, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		});

		console.log(`MongoDB Connected: ${conn.connections[0].name}`.cyan.underline.bold);
	} catch (error) {
		console.error(`Error: ${error.message}`.red.underline.bold);
		process.exit(1);
	}
};

module.exports = connectDB;
