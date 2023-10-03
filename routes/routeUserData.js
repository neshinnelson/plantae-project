import express, { Router } from 'express'
import ModelUserData from '../models/modelUserData.js'
import bcrypt from 'bcrypt'
import jwt  from 'jsonwebtoken'
import 'dotenv/config'
import cookieParser from 'cookie-parser';
import { apiKey } from '../index.js'

const router = express.Router()

router.use(cookieParser())

// array to store refresh tokens
export const refreshTokens = []

router.get('/:id',async(req,res)=>{
    if (req.query.apikey=== apiKey) {

        if(req.query){
            const searchParam = req.query.address?'address':req.query.boughtItem?'boughtItem':'_id firstName secondName'
            // console.log(searchParam);
            try{
                const data = await ModelUserData.findById(req.params.id,searchParam)
                res.json({respone:'success',message:'query is fetched',data})
            }catch(err){
                console.log('unable to fetch data from db');
                console.error(err);
                res.json({respone:'failed',message:'query is wrong'})
            }
        }
        // try{
        //     const data = await ModelUserData.findById(req.params.id)
        //     res.cookie("jwt",'working')
        //     res.json(data)
        // }
        // catch(err){
        //     console.error(err);
        //     res.send('serve error').status(500)
        // }
        
    }else{
        console.log('no api key');
        res.json({respose:'un authorised.no api key!'})
    }   
})
router.post('/',async(req,res)=>{
    console.log(req.body);
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    console.log(regEx.test(req.body.password))

   try{
    if(req.body.userName.length > 8 && regEx.test(req.body.password)){
        // hashing the password using bcrypt
        console.log(regEx.test(req.body.password.length));
        const hashedPass = await bcrypt.hash(req.body.password,10)
        console.log(hashedPass)
        const data =  ModelUserData(req.body);
        data.password = hashedPass
        await data.save();
        res.json({response:'success',message:'data posted to db'})
        console.log('data posted to db');
    } 
    }catch(err){
        console.error('regEx failed',err);
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
    console.log(data);

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

//update handle
router.put('/',async(req,res)=>{
    console.log(req.body);
   try{
    const userId = req.body.userId
    delete req.body.userId
    const update = req.body
    const data = await ModelUserData.findByIdAndUpdate(userId,{address:update},{new:true})
    res.json({response:'success',message:'user data updated',data})
   }catch(err){
    console.log('error updating adding userdata');
    console.error(err);
    res.json({response:'failed',message:'server error'})
   }
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