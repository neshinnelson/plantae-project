import express from "express"
import ModelCheckout from "../models/modelCheckout.js"
import { apiKey } from "../index.js"
import { hasApiKey } from "../middleware/checkApiKey.js"
import { verifyToken } from "../functions.module.js"


const router = express.Router()

// handle to get checkout products
router.get('/:id',hasApiKey,async(req,res)=>{
    const queryToken = req.query.token
    const authHeader = req.headers.authorization? req.headers.authorization.split(' ')[1]:'' 
    const clientToken = authHeader ? authHeader : queryToken

    //verify client token
    const isTokenTrue = await verifyToken(clientToken)
    if(isTokenTrue !== true) return res.status(401).json({
        response:'failed',message:'invalid token'
    })

    //cheking req.params.id exists ?
    if(!req.params.id) return res.status(404).json({
        response:'failed',message:'no id in params'
    })

    try{
        const data = await ModelCheckout.find({userId:req.params.id},{_id:0})
        //if no data found
        if(data.length===0) return res.status(404).json({response:'failed',message:'no id or wrong id specified'})

        res.json({response:'success',message:'fetched all products in the given user id', data})
    }catch(err){
        console.log('unable to get data now! :');
        console.error(err);
    }
})

//handle to post products to checkout
router.post('/',hasApiKey,async(req,res)=>{
    const queryToken = req.query.token
    const authHeader = req.headers.authorization? req.headers.authorization.split(' ')[1]:'' 
    const clientToken = authHeader ? authHeader : queryToken

    //verify client token
    const isTokenTrue = await verifyToken(clientToken)
    if(isTokenTrue !== true) return res.status(401).json({
        response:'failed',message:'invalid token'
    })

    //cheking req.params.id exists ?
    // if(!req.params.id) return res.status(400).json({
    //     response:'failed',message:'no id in params'
    // })
    if(!req.body.userId) return res.status(404).json({
        response:'failed',message:'req.body is empty'
    })
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
            res.status(404).json({respose:'failed',message:'product id id empty '})

        }
    }
    else if(doesExists.length === 0){
        
        const data = await ModelCheckout(req.body)
        console.log(data);
        data.save()
        res.json({response:'success',message:'product id added'})
    } else{
        res.status(400).json({respose:'failed',message:'userId already exists'})
    }
}
catch(err){
    console.log('error posting id to checkout');
    console.error(err);
}
})

// handle to delete a product id 
router.delete('/:id',hasApiKey,async(req,res)=>{
    const userId = req.params.id
    const itemId = req.query.itemId
    const queryToken = req.query.token
    const authHeader = req.headers.authorization ? req.headers.authorization.split(' ')[1]:''
    const clientToken = authHeader ? authHeader : queryToken

    //verify client token
    const isTokenTrue = await verifyToken(clientToken)
    if(isTokenTrue !== true) return res.status(401).json({
        response:'failed',message:'invalid token'
    })

    //checking wheather userId & itemId in req
    if(!userId||!itemId) return res.status(404).json({
        response:'failed',message:'no userid or item id'
    })
    
       
        try{
            const data =  await ModelCheckout.find({userId:userId})
            if(data.length===0) return res.status(404).json({
                response:'failed',message:'no user found! check user id.'
            })
            const update = data[0].productId.filter(item=>item !== itemId)
            const deleted = await ModelCheckout.findByIdAndUpdate(data[0]._id,{productId:update})
            if(!deleted) return res.status(404).json({response:'failed',message:'no id or itemid matched'})
            res.json({response:'success',message:'dateted'})
        }catch(err){
            console.log('unable to delete. no data maching query!');
            console.error(err);
            res.json({response:'failed'})
        }
})

export default router