import express from "express"
import ModelCheckout from "../models/modelCheckout.js"
import { apiKey } from "../index.js"


const router = express.Router()


router.get('/:id',async(req,res)=>{
    try{
        const data = await ModelCheckout.find({userId:req.params.id})
        if(!data) return res.json({response:'failed',message:'no id or wrong id specified'})
        res.json({response:'success',message:'fetched all products in the given user id', data})
    }catch(err){
        console.log('unable to get data now! :');
        console.error(err);
    }
})

router.post('/',async(req,res)=>{
try{
    const doesExists = await ModelCheckout.find({userId:req.body.userId})
    // console.log(doesExists,1);
    if(doesExists.length === 1){
        try{
            const update = {
                productId:doesExists[0].productId
            }
            update.productId.push(req.body.productId[0])
            await ModelCheckout.findByIdAndUpdate(doesExists[0]._id,{productId:update.productId})
            res.json({response:'success',message:'product id added'})
        }catch(err){
            console.log('error in updating !');
            console.error(err);
            res.json({respose:'failed',message:'product id id empty '})

        }
    }
    else if(doesExists.length === 0){
        
        const data = await ModelCheckout(req.body)
        console.log(data);
        data.save()
        res.json({response:'success',message:'product id added'})
    } else{
        res.json({respose:'failed',message:'userId already exists'})
    }
}
catch(err){
    console.log('error posting id to checkout');
    console.error(err);
}
})

router.delete('/:id',async(req,res)=>{
    const userId = req.params.id
    const itemId = req.query.itemId
    const checkApiKey = req.query.apikey
    
    if(checkApiKey===apiKey){
       
        try{
            const data =  await ModelCheckout.find({userId:userId})
            const update = data[0].productId.filter(item=>item !== itemId)
            const deleted = await ModelCheckout.findByIdAndUpdate(data[0]._id,{productId:update},{new:true})
            if(!deleted) return res.json({response:'failed',message:'no id or itemid matched'})
            res.json({response:'success',message:'dateted', deleted})
        }catch(err){
            console.log('unable to delete. no data maching query!');
            console.error(err);
            res.json({response:'failed'})
        }
    }else{
        console.log('api key missing');
        res.json({response:'api key missing'})
    }
})

export default router