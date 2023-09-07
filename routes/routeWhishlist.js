import express from 'express';
import ModelWhishlist from '../models/modelWhishlist.js'

const router = express.Router();

router.get('/:id',async(req,res)=>{
    try{
        const data = await ModelWhishlist.findById(req.body.params)
        res.json(data)
    }
    catch(err){
        console.error('server error',err);
        res.json('unable to fetch data now!')
    }
})

router.post('/',async(req,res)=>{
    try{
        const data = ModelWhishlist(req.body)
        await data.save()
    }
    catch(err){
        console.error('server error',err);
        res.json('unable to post data')
    }
})

export default router