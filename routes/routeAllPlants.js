import express from 'express';
import ModelAllPlants from '../models/modelPlantData.js'
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import randomstring from 'randomstring'
import { checkQueryPlant, verifyAdminToken } from '../functions.module.js';
import { hasApiKey } from '../middleware/checkApiKey.js';


const router = express.Router()


// to filter plants on category name price rating stock
router.get('/',hasApiKey,async(req,res)=>{

   if(Object.keys(req.query).length === 0) return res.status(404).json({response:'failed',message:'no query found'})

   const searchParams = checkQueryPlant(req.query)

   try{
      
         const data = await ModelAllPlants.find(searchParams,{_id:0}).exec()
         if(data.length===0){
            return res.status(404).json({response:'failed',message:'no data found check entered query'})
         } 
         res.json({response:'success',message:'data fetched',data})    
    
   }
   catch(err){
         console.log(err);
         const data = 'server is down'
         res.status(500).json(data)
   }
    
})

// get request handle for todays special offer.
// token authentication required
router.get('/special-offer',hasApiKey,async(req,res)=>{

   //recieving token from query params
   const queryToken = req.query.token
   //recieving token from authorization header
   const authHeader = req.headers['authorization']
   console.log(authHeader);
   const authToken = authHeader && authHeader.split(' ')[1]
   console.log(authToken);

   // assigning token recieved from query or auth to token variable.
   const token = queryToken?queryToken:authToken
   console.log(token);

   if(token===undefined){
         console.log(' no token')
         res.status(401).json({response:'failed', message:'invalid token'})
   } 

   try{
      jwt.verify(token,process.env.JWT_SECRET_KEY,(err,payLoad)=>{
         if(err)return res.json({respose:'failed',message:'token expired'})
         console.log(payLoad);
      })
      // console.log(checkJwt);
      // if(checkJwt){
         const data = await ModelAllPlants.find({_id:'64f8b09987ed72ac838e9286'})
         res.json({response:'success', message:"today's offer!",data})
      // }            
   }
   catch(err){
      console.error('cannot verify token. server error!!',err);
   }
   
})

router.post('/',async(req,res)=>{
    req.body.imgLinks = req.body["img"].split(' ')
    req.body.potColor = req.body["pot-color"].split(' ')
    req.body.rating = parseFloat(Number(req.body["rating"]))
   
   try{
    const data = ModelAllPlants(req.body)
    await data.save()
    res.json(data).status(201)
   }
   catch(err){
    console.error('error in posting data',err);
    res.json('data not acceptable!').status(400)
    console.log(req.body['category']);
    console.log(req.body.category);
    console.log(req.body.name);
    console.log(req.body.shippingTime);
   }

})

// post handle for admin to post new plant
router.post('/admin-post',hasApiKey,async(req,res)=>{

   //checking wheather token exist or not
   const queryToken = req.query.token?req.query.token : ''
   const authToken = req.headers.authorization?req.headers['authorization'].split(' ')[1] : ''
   const token = queryToken?queryToken:authToken
   if(!token) return res.status(401).json({response:'failed',message:'no token found'})

   const isTokenActive = await verifyAdminToken(token)
   if(isTokenActive !== true) return res.status(401).json({response:'failed',message:'invalid token'})

   //checkig req.body exists
   if(!req.body) return res.status(404).json({response:'failed',message:'required fields are empty!'})

  try{
      const data = ModelAllPlants(req.body);
      data.plantId = randomstring.generate()

      await data.save();
      res.status(201).json({res:'success',message:'new plant is posted to database'})
  }
  catch(err){
   console.error('unable to find data',err);
   res.status(406).json({res:'failed',message:'unable to post. check the data entered!'})
  }

})

router.put('/admin-put/:id',hasApiKey,async(req,res)=>{
   const queryToken = req.query.token ? req.query.token : ''
   const authHeader = req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''
   const adminToken = authHeader? authHeader : queryToken

   //verifying admin token
   const isTokenTrue = jwt.verify(adminToken,process.env.JWT_ADMIN_SECRET_KEY,(err)=>{
      if(err) return err
      return true
   })
   if(isTokenTrue !== true) return res.status(401).json({response:'failed',message:'invalid token'})

   const plantId = req.params.id
   if(!plantId) return res.status(404).json({response:'failed',message:'no plant id'})

   const update = req.body

   try{
         const data = await ModelAllPlants.updateOne({plantId:plantId},update,{new:true,_id:0})
         console.log(data);
         if(!data||data.acknowledged===false) return res.status(404).json({response:'failed'})
     
         res.json({response:'success',message:'document updated',data})
   }catch(err){
      console.log('error updating documents :');
      console.error(err);
   }
})

export default router;