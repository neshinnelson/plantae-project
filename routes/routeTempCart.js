import express from 'express';
import ModelTempCart from '../models/modelTempCart.js';
import { hasApiKey } from '../middleware/checkApiKey.js';

const router = express.Router();

// clearing temeperary cart every 5 minutes
setInterval(async()=>{
 await ModelTempCart.deleteMany({})
 console.log('temp-cart is cleared')
},1000*60*5)

router.get('/:id',hasApiKey,async(req,res)=>{
   //checking wheather req.params.id exists ?
   if(!req.params.id) return res.status(400).json({
    response:'failed',message:'no id'
   })
    try{
        const data = await ModelTempCart.find({userId:req.params.id})
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


router.post('/',hasApiKey,async(req,res)=>{   

    //checking req,body exists ?
    if(Object.keys(req.body).length===0) return res.status(400).json({
        response:'failed',message:'no req.body found'
    })
    
    try{
        const data = ModelTempCart(req.body)
        await data.save();
        res.json({response:'success',message:'item moved to cart',data})
    }
    catch(err){
        console.error('unable to post data now. check data', err);
        res.json('unable to post data now. check data')
    }
})

// update req handle
router.put('/:id',async(req,res)=>{
    if(Object.keys(req.body).length < 1) return res.status(404).json({
        response:'failed', message:'no req.body'
    })
    const update = req.body
    console.log(update);
    try{
        const data = await ModelTempCart.updateOne({plantId:req.params.id},update)
        .select({_id:0})
        .exec()
        if(data.acknowledged===false) return res.status(404).json({
            response:'failed', message:'no plant id found '
        })
        res.json({response:'success',message:'updated',data})
    }catch(err){
        console.log('error in updating temp-cart');
        console.error(err);
    }
})

router.delete('/:id',hasApiKey,async(req,res)=>{
    console.log(req.params.id);
    const data = await ModelTempCart.deleteOne({plantId:req.params.id})
    if(data.acknowledged===false) return res.status(404).json({
        response:'failed',message:'no id mathched search'
    })
    res.json({data,message:'item deleted from cart'})
})
export default router