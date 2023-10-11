import express from 'express';
import ModelCart from '../models/modelCart.js';
import { hasApiKey } from '../middleware/checkApiKey.js';
import { verifyToken } from '../functions.module.js';

const router = express.Router();

router.get('/:id',hasApiKey,async(req,res)=>{
    const queryToken = req.query.token ? req.query.token : ''
    const authHeader = req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''
    const clientToken = authHeader? authHeader : queryToken


    const isTokenTrue = await verifyToken(clientToken)
    if(isTokenTrue !== true) return res.status(401).json({
        res:'failed',message:'invalid token'
    })
    try{
        const data = await ModelCart.find({userId:req.params.id},{_id:0})
        if(data.length===0) return res.status(404).json({
            response:'failed'
        })
        res.json({response:'success',message:'all cart is fetched belongs to the useris is fetched',data})

    }
    catch(err){
        console.error('unable to fetch data now',err);
        res.status(404).json('please check id,unable to fetch data now!')
    }
})

//get all item in cart
router.get('/',async(req,res)=>{
    const data = await ModelCart.find()
    res.json({res:'success',message:'all cart is fetched',data})
})

// post to cart
router.post('/',hasApiKey,async(req,res)=>{  
    const queryToken = req.query.token ? req.query.token : ''
    const authHeader = req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''
    const clientToken = authHeader? authHeader : queryToken

    //checking client token
    const isTokenTrue = await verifyToken(clientToken)
    if(isTokenTrue !== true) return res.status(401).json({
        res:'failed',message:'invalid token'
    })

    try{
        const data = ModelCart(req.body)
        await data.save();
        res.json({response:'success',message:'item moved to cart',data})
    }
    catch(err){
        console.error('unable to post data now. check data', err);
        res.json('unable to post data now. check data')
    }
})

//put request handle change in quantity
router.put('/:id',hasApiKey,async(req,res)=>{
    const queryToken = req.query.token ? req.query.token : ''
    const authHeader = req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''
    const clientToken = authHeader? authHeader : queryToken

    //checking client token
    const isTokenTrue = await verifyToken(clientToken)
    if(isTokenTrue !== true) return res.status(401).json({
        res:'failed',message:'invalid token'
    })

    const update = req.body && req.body
    console.log(update);
   try{
    const data = await ModelCart.updateOne({plantId:req.params.id},update)
    .select({_id:0})
    .exec()
    if(data.acknowledged===false) return res.status(404).json({
        response:'failed', message:'no plant id found '
    })
    if(!data) return res.status(404).json({response:'failed',message:'quantity was unable to update'}) 
    res.json({response:'success',message:'cart updated'})
   }
   catch(err){
    console.error('put request failed',err);
   }
})

router.delete('/:id',hasApiKey,async(req,res)=>{
    const queryToken = req.query.token ? req.query.token : ''
    const authHeader = req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''
    const clientToken = authHeader? authHeader : queryToken

    //checking client token
    const isTokenTrue = await verifyToken(clientToken)
    if(isTokenTrue !== true) return res.status(401).json({
        res:'failed',message:'invalid token'
    })

    const data = await ModelCart.findOneAndDelete({plantId:req.params.id})
    console.log(data,':dek');
    if(data===null||data.length===0) return res.status(404).json({response:'failed',message:'invalid user id'})
    res.json({data,message:'item deleted from cart'})
})
export default router