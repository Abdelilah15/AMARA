import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFICATION_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';


export const register = async (req, res)=>{
    const {name, email, password, username} = req.body

    if(!name || !email || !password || !username){
        return res.json({success: false, message: 'Missang Details'})
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.' });
    }

    try {
        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({success: false, message: 'User already exists'});
        }

        const existingUsername = await userModel.findOne({ username });
        if (existingUsername) {
            return res.json({ success: false, message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const user = new userModel({name, email, username, password: hashedPassword})
        await user.save();
            
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //sending email verification
        const mailOperation = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'ⴰⵏⵙⵓⴼ ⵙⵉⴽ',
            text: `ⴰⵎⵉⴹⴰⵏ ⵏⵏⴽ ⵉⴳⴰⴷⴰ ⵙ ⵍⵉⵎⵉⵍ: ${email}`
        }

        await transporter.sendMail(mailOperation);

        return res.json({success: true});

    } catch (error){
        res.json({success: false, message: error.message});
    }
}

export const login = async (req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: 'Email and password are required'})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'Invalid email'})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.json({success: false, message: 'Invalid password'})
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success: true});

    }catch (error){
        return res.json({success: false, message: error.message});
    }
}

export const logout = async (req, res)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success: true, message: "logged Out"})

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

//verification email
export const sendVerifyOtp = async (req, res)=>{
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success: false, message: "Account Already verified"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 30 * 60 * 1000

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            //`OTP ⵏⵏⴽ ⵉⴳⴰ : ${otp}. ⵙⴳⴰⴷⴷⴰ ⴰⵎⵉⴹⴰⵏ ⵏⵏⴽ`
            html: EMAIL_VERIFICATION_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)
        }
        await transporter.sendMail(mailOption);
        res.json({ success: true, message: 'OTP ⵢⴰⴼⵓⴹ ⵏⵏ ⵙ ⵍⵉⵎⵉⵍ ⵏⵏⴽ'});


    } catch (error) {
        res.json({ success: false, message: error.message});
    }
}

//verify email s l'OTP
export const verifyEmail = async (req, res)=>{
    const {userId, otp} = req.body;

    if(!userId || !otp) {
        return res.json({success: false, message: 'Missing Details'});

    }
    try {
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP Expired'});
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({success: true, message: 'Email verified successfully'})


    } catch (error) {
        return res.json({success: false, message: error.message});
    }

}

// zr is itvirifa l'compt
export const isAccountVerified = async (req, res)=>{
    try {
        return res.json({success: true });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// password reset OTp
export const sendResetOtp = async (req, res)=>{
    const {email} = req.body;

    if(!email){
        return res.json({success: false, message: 'Email is required'})
    }

    try {
        const user = await userModel.findOne({email});
        if (!user) {
            return res.json({success: false, message: 'User not found'})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 30 * 60 * 1000

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP.',
            // text: `OTP ⵏⵏⴽ ⴰⴼⴰⴷ ⴰⴷ ⵜⵙⴳⴰⴷⴷⴰⵜ ⵜⴳⵓⵔⵉ ⵉ ⵓⵣⵔⴰⵢ ⵢⴰⴹⵏ ⵉⴳⴰ : ${otp}.
            html: PASSWORD_RESET_TEMPLATE.replace('{{otp}}', otp).replace('{{email}}', user.email)

        };
        await transporter.sendMail(mailOption);

        return res.json({success: true, message: `OTP ⵢⴰⴼⵓⴹ ⵏⵏ ⵙ ⵍⵉⵎⵉⵍ ⵏⵏⴽ`});
        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Reset password
export const resetPassword = async (req, res)=>{
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({ success: false, message: 'Email, OTP and new password are required'});
    }

    try {
        const user = await userModel.findOne({email});
        if (!user) {
            return res.json({ success: false, message: 'User not found'});
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success: true, message: 'Password has been reset successfully'});


        
    } catch (error) {
        return res.json({ success: false, message: error.message});
    }
}