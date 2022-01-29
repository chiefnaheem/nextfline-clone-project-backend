import mongoose from "mongoose";
require('dotenv').config();

import { MongoMemoryServer } from "mongodb-memory-server";
export const connectDB = () => {
  try {
    mongoose.connect(process.env.MONGO_URI as string).then(() => {
      console.log("Connected to DB");
    });
  } catch (error) {
    console.log(error);
  }
};
export const connectTestDB = () => {
  try{
    MongoMemoryServer.create().then((mongo) => {
      const uri:any = mongo.getUri();
      mongoose.connect(uri).then(() => {
        console.log("connected to testDB");
      });
    });
  }
  catch (error:any) {
    console.log(error);
  }
};