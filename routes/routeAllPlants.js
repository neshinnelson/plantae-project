import express from 'express';
import ModelAllPlants from '../models/modelPlantData.js'
const router = express.Router()

router.get('/filter',async(req,res)=>{
   const category = req.query.category
   console.log(category);
   
   try{
    const data = await ModelAllPlants.find({category:category})
    res.json(data)
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

export default router;