import express from 'express';
import ModelCart from '../models/modelCart.js';

const router = express.Router();

router.get('/:id',async(req,res)=>{
    try{
        const data = await ModelCart.find({userId:req.params.id})
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
    const data = await ModelCart.find()
    res.json({res:'success',message:'all cart is fetched',data})
})


router.post('/',async(req,res)=>{   
    try{
        const data = ModelCart(req.body)
        await data.save();
        res.json({res:'success',message:'item moved to cart',data})
    }
    catch(err){
        console.error('unable to post data now. check data', err);
        res.json('unable to post data now. check data')
    }
})

router.delete('/:id',async(req,res)=>{
    const data = await ModelCart.findOneAndDelete({name:req.params.id})
    res.json({data,mesg:'gfgf'})
})
export default router