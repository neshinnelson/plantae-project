import express from 'express';
import ModelCategory from '../models/modelCategory.js'

const router = express.Router();

router.get('/',async(req,res)=>{
    const category = req.query.category
    try{
        const data = await ModelCategory.find({category:category})
        res.json(data)
    }
    catch(err){
        console.error('server error',err);
        res.json('internal server error').status(500)
    }
})

router.post('/',async(req,res)=>{
   try{
    const data = ModelCategory(req.body);
    await data.save();
    res.json(data).status(201)
   }
   catch(err){
    console.error('server error',err);
    res.json('server error').status(500)
   }
})

export default router