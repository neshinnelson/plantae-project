import express, { Router } from 'express'
import ModelUserData from '../models/modelUserData.js'
import bcrypt from 'bcrypt'
import jwt  from 'jsonwebtoken'
import 'dotenv/config'
import cookieParser from 'cookie-parser';

const router = express.Router()

router.use(cookieParser())

// array to store refresh tokens
export const refreshTokens = []

router.get('/:id',async(req,res)=>{
    
    try{
        const data = await ModelUserData.findById(req.params.id)
        res.cookie("jwt",'fucking working')
        res.json(data)
    }
    catch(err){
        console.error(err);
        res.send('serve error').status(500)
    }
})
router.post('/',async(req,res)=>{
    // console.log(req.body);

    if(req.body.userName.length > 8 && req.body.password.length > 8){
        // hashing the password using bcrypt
        const hashedPass = await bcrypt.hash(req.body.password,10)
        console.log(hashedPass)
        const data =  ModelUserData(req.body);
        data.password = hashedPass
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
    let userFullName
    let userId
    let jwtToken
    let refreshJwtToken

    let data =  await ModelUserData.find({userName: req.body.userName})
    // if(!data) response = 'failed'; message='check data entered'

    const checkPass = await bcrypt.compare(req.body.password,data[0].password)

    if(data[0].userName===req.body.userName && checkPass){
        // issuing a jwt tockent to user
        let secretKey = process.env.JWT_SECRET_KEY
        const userName = {userName: data[0].userName}
         const tocken = jwt.sign(userName,secretKey,{expiresIn:'60s'})
         const refreshToken = jwt.sign(userName,process.env.JWT_REFRESH_KEY)
         refreshTokens.push(refreshToken)
         console.log(refreshTokens);
         
         jwtToken = tocken
         refreshJwtToken = refreshToken
         
         res.cookie("jwt",tocken)
         res.cookie("jwt",'fdfdfdfdfdf')
        response = 'success'
        message='user is authorised'
        isLogedIn = true
        userFullName = data[0].firstName +" "+ data[0].secondName
        userId = data[0]._id        
    }
    else{
        response = 'failed'
        message = 'Unauthorized: Invalid username or password'
        isLogedIn = false
        // throw new Error('Unauthorized: Invalid username or password');
    }
    // res.setHeader('Set-Cookie',jwtTocken)
    res.json({response,message,isLogedIn,userFullName,userId,jwtToken,refreshJwtToken})
})

//middleware to check jwt login tocken
// const authenticate = (req,res,next)=>{
//     const authHeader = req.headers['Authorization']
//     console.log(authHeader);
//     const token = authHeader && authHeader.split(' ')[1]
//     if(!token)return res.sendStatus(401)

//     jwt.verify(token,process.env.JWT_SECRET_KEY,(err,user)=>{
//         if(err) return res.sendStatus(403)
//         req.user = user
//     next()
//     })

//middle to verify token
// const verifyToken = (req,res,next)=>{
//     const token = req.headers['Authorization']
//     console.log(token);

//     const jwt = token.split(' ')[1]
//     console.log(jwt);
//     next()
// }

router.get('/jwt-test',(req,res)=>{

    // const authHeader = req.headers['Authorization']
    // console.log(authHeader);
    // const token = authHeader && authHeader.split(' ')[1]
    // if(!token)return res.sendStatus(401)

    // jwt.verify(token,process.env.JWT_SECRET_KEY,(err,user)=>{
    //     if(err) return res.sendStatus(403)
    //     req.user = user
    // })
    // res.cookie("jwt",'fdfdfdfdfdf')

    res.send({response:'success'})
})


export default router