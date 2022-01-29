import { Schema, model } from 'mongoose';
import validator from "validator";
import { IList } from "../types/types";
const schema = new Schema<IList> ({
    title : {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String
    },

    genre :{
        type: String
    },
    content: {
        type: Array
    },
}, {
    timestamps: true
})
const List = model<IList>('List', schema)
export default List;