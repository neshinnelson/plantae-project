import mongoose from "mongoose";

 const userSchema = new mongoose.Schema({
    firstName:{type:String,required:true},
    secondName:{type:String,required:true},
    email:{type:String,required:true},
    userName:{type:String,required:true},
    password:{type:String,required:true},
    phone:{type:Number,required:true},
    address:{type:Object},
    boughtItems:{type:Array}
})

export default new mongoose.model('User-Data',userSchema)

