import mongoose from "mongoose";

const plantSchema = new mongoose.Schema({
    category:{type:String,required:true},
    name:{type:String,required:true},
    imgLinks:{type:Array,required:true},
    price:{type:Number,required:true},
    rating:{type:Number,required:true},
    height:{type:Number,required:true},
    potColor:{type:Array,required:true},
    stock:{type:Number,required:true},
    shippingTime:{type:Number,required:true},
    description:{type:String,required:true}
})

export default new mongoose.model('all plant',plantSchema)