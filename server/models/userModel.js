import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    image: {type: String, default: ''},
    banner: {type: String, default: ''},
    profileType: {type: String, default: 'personal', enum: ['personal', 'professional']},
    bio: {type: String, default: ''},
    verifyOtp: {type: String, default: ''},
    verifyOtpExpireAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetOtp: {type: String, default: ''},
    resetOtpExpireAt: {type: Number, default: 0},

    links: [{
        title: {type: String},
        url: {type: String}
    }]
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;