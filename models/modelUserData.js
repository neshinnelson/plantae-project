import mongoose from "mongoose";

 const userSchema = new mongoose.Schema({
    admin:{type:Boolean,default:false},
    firstName:{type:String,required:true},
    secondName:{type:String,required:true},
    email:{type:String,unique:[true,'this email is already registered'],required:true},
    userName:{type:String,unique:[true,'this username is already in use'],required:[true,'you need a username to login']},
    password:{type:String,unique:true,required:[true,'you need a password to login']},
    address:{
        firstName:{type:String},
        secondName:{type:String},
        phone:{type:Number},
        shippingAddress:{type:String},
        appartment:{type:String},
        country:{type:String},
        city:{type:String},
        state:{type:String},
        pincode:{type:Number}
    },
    boughtItems:[
        {time:{type:String},
         productId:{type:String}}
    ],
    isActive:{type:Boolean, default:false},
    userId:{type:String}
})

export default new mongoose.model('User-Data',userSchema)

