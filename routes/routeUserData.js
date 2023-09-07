import express, { Router } from 'express'
import ModelUserData from '../models/modelUserData.js'

const router = express.Router()

router.get('/:id',async(req,res)=>{
    
    try{
        const data = await ModelUserData.findById(req.params.id)
        res.json(data)
    }
    catch(err){
        console.error(err);
        res.send('serve error').status(500)
    }
})
router.post('/',async(req,res)=>{

    if(req.body.userName.length > 8 && req.body.password.length > 8){
        const data =  ModelUserData(req.body);
        await data.save();
        res.json({response:'success',message:'data posted to db'})
        console.log('data posted to db');
    }
    else{
        console.log('user name or pasword is less than 8');
        res.json({response:'failed',message:'user name or pasword is less than 8'})
    }
})

router.post('/authorise', async(req,res)=>{
    let response
    let message
    let isLogedIn

    let data =  await ModelUserData.find({userName: req.body.userName})
    // console.log(data);

    if(data[0].userName===req.body.userName && data[0].password===req.body.password){
        response = 'success'
        message='user is authorised'
        isLogedIn = true
    }
    else{
        response = 'failed'
        message = 'Unauthorized: Invalid username or password'
        isLogedIn = false
        // throw new Error('Unauthorized: Invalid username or password');
    }
    res.json({response,message,isLogedIn})
})

export default router