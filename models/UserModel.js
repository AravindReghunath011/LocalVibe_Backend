import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar:{type:String,
        default:"https://res.cloudinary.com/ddcx6tsgg/image/upload/v1748279531/default_xlefjr.png"}
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
