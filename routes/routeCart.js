import express from 'express';
import ModelCart from '../models/modelCart.js';

const router = express.Router();

router.get('/:id',async(req,res)=>{
    try{
        const data = await ModelCart.findById(req.params.id)
        res.json(data)
    }
    catch(err){
        console.error('unable to fetch data now',err);
        res.json('please check id,unable to fetch data now!')
    }
})

router.post('/',async(req,res)=>{   
    try{
        const data = ModelCart(req.body)
        await data.save();
        res.json(data)
    }
    catch(err){
        console.error('unable to post data now. check data', err);
        res.json('unable to post data now. check data')
    }
})

export default router