import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Invalid email address'],
    },
    token: {
        type: String,
        unique: true,
    },
}, {
    timestamps: false,
    versionKey: false,
});

const User = mongoose.model('users', userSchema);

export default User;
