import { Schema, model } from "mongoose";
import validator from "validator";
import { IMovie } from "../types/types";
const schema = new Schema<IMovie> ({
    title : {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
    },
    img: {
        type: String
    },
    imgSm:{
        type: String
    },
    imgTitle: {
        type : String
    },
    trailer:{
        type: String
    },
    video: {
        type: String
    },
    year: {
        type:String
    },
    limit:{
        type: Number
    },
    genre :{
        type: String
    },
    isSeries: {
        type: Boolean
    }
}, {
    timestamps: true
})
const Movie = model<IMovie>('Movie', schema)
export default Movie