import mongoose from "mongoose";

const connectDB = async ()=>{
    mongoose.connection.on('connected', ()=>
        console.log("ⴹⴰⵜⴰ ⴱⴰⵣ ⵜⴳⴰⴷⴷⴰ"
        ));
    await mongoose.connect(`${process.env.MONGODB_URL}/amara`);
};

export default connectDB;