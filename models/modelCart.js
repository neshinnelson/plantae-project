import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    category:{type:String,required:true},
    name:{type:String,required:true},
    imgLinks:{type:Array,required:true},
    price:{type:Number,required:true},
    quantity:{type:Number,required:true},
    potColor:{type:Array,required:true},
    
})

export default new mongoose.model('cart', cartSchema)

// name:{type:mongoose.Schema.Types.ObjectId,ref:'cart'},
    // imgLinks:{type:mongoose.Schema.Types.ObjectId,ref:'cart'},
    // price:{type:mongoose.Schema.Types.ObjectId,ref:'cart'},
    // quantity:{type:mongoose.Schema.Types.ObjectId,ref:'cart'},
    // potColor:{type:mongoose.Schema.Types.ObjectId,ref:'cart'},