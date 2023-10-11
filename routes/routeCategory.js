import express from 'express';
import ModelCategory from '../models/modelCategory.js'
import { hasApiKey } from '../middleware/checkApiKey.js';
import { verifyAdminToken } from '../functions.module.js';

const router = express.Router();

// filter data 
//if no query, all data is fetched
//if req.query.name=category name. category only is fetched
router.get('/',hasApiKey,async(req,res)=>{

    //checking wheather req.query.find exists ?
    const find = req.query.name ? {name: req.query.name} : {}
    if(Object.keys(req.query).length<1) return res.status(404).json({
        response:'success',message:'no query found'
    })

    try{
        const data = await ModelCategory.find(find).exec()
        
        const resData = []
        data.map(item=>{
            const a = {name:item.name,description:item.description}
            resData.push(a)
        })
         
        res.json({response:'success',resData})
    }
    catch(err){
        console.error('server error',err);
        res.status(500).json('internal server error').status(500)
    }
})

router.post('/',hasApiKey,async(req,res)=>{
    const queryToken = req.query.token ? req.query.token : ''
    const authHeader = req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''
    const adminToken = authHeader? authHeader : queryToken

    //checking admin token ?
    const isTokenTrue = await verifyAdminToken(adminToken)
    if(isTokenTrue !== true) return res.status(401).json({
        res:'failed',message:'invalid token'
    })
    if(!req.body.name) return res.status(404).json({
        response:'failed',message:'req.body is empty'
    })
   try{
    const data = new ModelCategory(req.body);
    console.log(data);
    await data.save();
    res.status(201).json({ response:'success',message:'new category created'})
   }
   catch(err){
    console.error('server error',err);
    res.status(500).json({response:'failed',message:'error ! check data entered'})
   }
})

export default router