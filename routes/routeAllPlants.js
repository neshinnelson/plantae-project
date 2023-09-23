import express from 'express';
import ModelAllPlants from '../models/modelPlantData.js'
import 'dotenv/config'
import jwt from 'jsonwebtoken'


const router = express.Router()

router.get('/filter',async(req,res)=>{
   const category = req.query.category
   const plantName = req.query.plantName
   // console.log(category);
   let searchKey = category?'category':'name'
   let searchItem = category?category:plantName
   
   // console.log(searchItem);

   try{
      if(!searchItem){
         const data = await ModelAllPlants.find()
         res.json(data)    
      }
      else if(searchKey==='category') {
         const data = await ModelAllPlants.find({category:searchItem})
         res.json(data)
      }
      else{
         const data = await ModelAllPlants.find({name:searchItem})
         res.json(data)
      }

   //  console.log('what');
   }
   catch(err){
    console.log(err);
    const data = 'server is down'
    res.json(data).status(500)
   }
    
})

// get request handle for todays special offer.
// token authentication required
router.get('/special-offer',async(req,res)=>{

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
         res.json({response:'failed', message:'invalid token'})
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

router.post('/new-plant',async(req,res)=>{
  try{
   if(data===''){
      res.json({res:'failed',message:'required fields are empty!'})
   }
   else{
      const data = ModelAllPlants(req.body);
      await data.save();
      res.json({res:'success',message:'new plant is posted to database'}).status(201)
   }
   
  }
  catch(err){
   console.error('unable to find data',err);
   res.json({res:'failed',message:'unable to post. check the data enterd!'}).status(400)
  }

})

export default router;