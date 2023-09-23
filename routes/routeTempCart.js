import express from 'express';
import ModelTempCart from '../models/modelTempCart.js';

const router = express.Router();

// clearing temeperary cart every 5 minutes
setInterval(async()=>{
 await ModelTempCart.deleteMany({})
 console.log('temp-cart is cleared')
},1000*60*5)

router.get('/:id',async(req,res)=>{
    try{
        const data = await ModelTempCart.find({userId:req.params.id})
        // res.json(data)
        res.json({res:'success',message:'all cart is fetched belongs to the useris is fetched',data})

    }
    catch(err){
        console.error('unable to fetch data now',err);
        res.json('please check id,unable to fetch data now!')
    }
})

//get all item in cart
router.get('/',async(req,res)=>{
    const data = await ModelTempCart.find()
    res.json({res:'success',message:'all items in temperary cart is fetched',data})
})


router.post('/',async(req,res)=>{   
    try{
        const data = ModelTempCart(req.body)
        await data.save();
        res.json({res:'success',message:'item moved to cart',data})
    }
    catch(err){
        console.error('unable to post data now. check data', err);
        res.json('unable to post data now. check data')
    }
})

router.delete('/:id',async(req,res)=>{
    const data = await ModelTempCart.findOneAndDelete({_id:req.params.id})
    res.json({data,message:'item deleted from cart'})
})
export default router