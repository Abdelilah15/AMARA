import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    username: {type: String, required: true, unique: true},
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
    usernameLastChanged: { type: Date, default: null },
    newEmailRequest: {type: String, default: ''},
    emailChangeOtp: {type: String, default: ''},
    emailChangeOtpExpireAt: {type: Number, default: 0},

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],

    savedCollections: { 
        type: [{
            name: { type: String, required: true },
            color: { type: String, default: 'bg-gray-200' }, // Stockera la classe CSS ou code hex
            pinned: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }],
    },
    savedPosts: [{
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'post' }, // Référence au modèle Post
        collectionName: { type: String, default: 'Général' },
        savedAt: { type: Date, default: Date.now }
    }],

    links: [{
        title: {type: String},
        url: {type: String}
    }]
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;