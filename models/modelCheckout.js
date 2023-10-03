import mongoose from 'mongoose'

const checkoutSchema = new mongoose.Schema({
    userId:{
        type: String,
        unique:true,
        required:[true,'you need to add user _id present in user-data collection']
    },
    productId : {
        type:Array,
        required:[true,'you need to add product _id present in allPlant collection,the type is an array']
    }
})

checkoutSchema.index({ userId: 1 }, { unique: true });


export default mongoose.model('checkout',checkoutSchema)