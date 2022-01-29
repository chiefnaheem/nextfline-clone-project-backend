export interface IUser {
    _id: string;
    isActive: boolean;
    isModified?: any;
    firstName?: string;
    lastName?: string;
    bioData?: string;
    username?: string;
    email: string;
    password: string | undefined;
    confirmNewPassword: string;
    profilePic?: string;
    // role: string;
    isAdmin: boolean;
    passwordResetToken?: string
    passwordExpires?: string;
    passwordResetTokenExpires?: Date;
    passwordChangedAt?: Date;
}
export interface IMovie {
    title : string;
    desc: string;
    img: string;
    imgSm: string;
    imgTitle: string;
    trailer : string;
    video: string;
    year : string
    limit: number;
    genre : string;
    isSeries: boolean;
}

export interface IList {
    title: string;
    type: string;
    genre: string;
    content: Object;
}

export interface Password {
    previousPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}
  
export interface ResetPassword {
    password: string;
    confirmNewPassword: string;
}

export type ResponseData = Record<string, any> | Record<string, any>[]