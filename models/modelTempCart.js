import mongoose from "mongoose";

const tempCartSchema = new mongoose.Schema({
    category:{type:String,required:true},
    name:{type:String,required:true},
    imgLinks:{type:Array,required:true},
    price:{type:Number,required:true},
    rating:{type:String,required:true},
    quantity:{type:Number,required:true},
    potColor:{type:Array,required:true},
    plantId:{type:String,required:true}
    
})

export default new mongoose.model('temp-cart', tempCartSchema)