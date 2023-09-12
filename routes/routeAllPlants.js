import express from 'express';
import ModelAllPlants from '../models/modelPlantData.js'
const router = express.Router()

router.get('/filter',async(req,res)=>{
   const category = req.query.category
   console.log(category);
   
   try{
      if(category===''){
         const data = await ModelAllPlants.find()
         res.json(data)    
      }
      else{
         const data = await ModelAllPlants.find({category:category})
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