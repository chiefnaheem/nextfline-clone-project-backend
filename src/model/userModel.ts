import Joi from "joi";
import { Schema, model } from "mongoose";
import { IUser } from "../types/types";
import Validator from 'validator'
import bcrypt from 'bcryptjs'

const userschema = new Schema<IUser>({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    bioData :String,
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        validate: {
            validator: Validator.isEmail,
            message: 'Please provide valid email',
        }
    },
    password: {
        type: String,
        required: [true, 'Please input your password']
    },
    confirmNewPassword: {
        type : String,
        required: [true, 'Please confirm your password'],
    },
    profilePic: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: false
    },
    // role : {
    //     type : String,
    //     default: 'user',
    //     enum: ['user', 'admin'],
    //     required: true
    // },
    isAdmin: {
        type: Boolean,
        default: false
    },
    passwordChangedAt: {
        type: Date,
    },
    passwordResetToken: {
        type: String,
    },
    passwordExpires: {
        type: String
    },
    passwordResetTokenExpires:{
        type: Date
    },

}, {
    timestamps: true
})
const User = model<IUser>('User', userschema)


// userschema.pre('save', async function (next){
//     const user: any = this;
//     if (!this.isModified('password')) {
//       return next();
//     }
//     this.password = await bcrypt.hash(this.password, 12);

//     this.repeatPassword = undefined;
  
//     next();
// });

  
userschema.methods.confirmPassword = async function (userPassword: string) {
    const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
};


export default User