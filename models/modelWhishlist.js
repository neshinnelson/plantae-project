
import mongoose from "mongoose";

const whishlistSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    category:{type:String,required:true},
    name:{type:String,required:true},
    imgLinks:{type:Array,required:true},
    price:{type:Number,required:true},
    quantity:{type:Number,required:true},
    potColor:{type:Array,required:true},
})

export default new mongoose.model('wishlist', whishlistSchema)