import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a name'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Please add your email'],
			unique: [true, 'Email already exists'],
		},
		password: {
			type: String,
			required: [true, 'Please add a password'],
			minlength: [6, 'Password must be at least 6 characters'],
		},
		avatar: {
			type: String,
		},
		date: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', UserSchema);

export default User;
