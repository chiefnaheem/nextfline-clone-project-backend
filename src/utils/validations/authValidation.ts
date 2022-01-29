import Joi from 'joi';
import { IUser, Password, ResetPassword } from '../../types/types';

export const validateUser = (user:IUser) => {
    const schema = Joi.object({
        firstName : Joi.string().max(30).required(),
        lastName: Joi.string().max(30).required(),
        username: Joi.string().max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(200).required(),
        confirmNewPassword: Joi.string().min(6).max(200).required(),
        isAdmin: Joi.boolean(),
    })
    return schema.validate(user)
}


export function validateUserLogin(user: IUser) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(200).required(),
    })
    return schema.validate(user)
}


export const validateChangePassword = (user: Password) => {
  const schema = Joi.object({
    previousPassword: Joi.string()
      .min(6)
      .required()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .error(() => new Error('previous password is required')),
    newPassword: Joi.string()
      .min(6)
      .required()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .error(() => new Error('new password is required')),
    confirmNewPassword: Joi.string()
      .required()
      .valid(Joi.ref('newPassword'))
      .error(() => new Error('passwords do not match')),
  });

  return schema.validate(user);
};

export const validateResetPassword = (user: ResetPassword) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(6)
      .required()
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
      .error(() => new Error('new password is required')),
    passwordConfirm: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .error(() => new Error('passwords do not match')),
  });

  return schema.validate(user);
};
