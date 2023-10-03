import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import jwt  from 'jsonwebtoken'
import { refreshTokens } from './routes/routeUserData.js';

//importing routes
import routeAllPlants from './routes/routeAllPlants.js'
import routeUserData from './routes/routeUserData.js'
import routeCategory from './routes/routeCategory.js'
import routeCart from './routes/routeCart.js'
import routeWhishlist from './routes/routeWhishlist.js'
import routeTempCart from './routes/routeTempCart.js'
import routeCheckout from './routes/routeCheckout.js'

//CONNECTING TO MONGODB
mongoose.connect(process.env.MONGO_CONNECT,{ useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection;
db.on('error',(err)=>{
    console.error('mongodb connection err',err);
})
db.on('open',()=>{
    console.log('connected to mongodb');
})

const app = express();
const port = process.env.PORT || 5000;
export const apiKey = process.env.API_KEY

//middleware
app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(cookieParser())

app.get('/',(req,res)=>{
    // res.send('<h1>Neshin Nodejs Developer</h1>')
    res.render('index.ejs')
})

app.use('/plants',routeAllPlants);
app.use('/user-data',routeUserData);
app.use('/category',routeCategory);
app.use('/cart',routeCart);
app.use('/wishlist',routeWhishlist);
app.use('/temp-cart',routeTempCart);
app.use('/checkout',routeCheckout)

// refresh token array
let copyRefreshTokens = refreshTokens
//generating new token using refresh token
app.post('/new-token',(req,res)=>{
    const refreshToken = req.body.refreshToken
    // console.log(refreshToken);
    // console.log(copyRefreshTokens);
    if(refreshToken===undefined) return res.json({response:'failed',message:'invalid refresh token'})
    if(!copyRefreshTokens.includes(refreshToken)) return res.json({response:'failed',message:'refresh token expired'})

    try{
        jwt.verify(refreshToken,process.env.JWT_REFRESH_KEY,(err,payload)=>{
            if(err) return res.json({response:'failed',message:'refresh token expired'})
            // console.log(payload);
        const data = {userName:payload.userName}
        const newToken = jwt.sign(data,process.env.JWT_SECRET_KEY,{expiresIn:'60s'})
        res.json({response:'success',message:'new token from refresh token', newToken})
            })
    }
    catch(err){
        console.error('unable to verify token',err);
        res.json({response:'failed',message:'unable to verify token. server error!'})
    }
        
})

// console.log(copyRefreshTokens);

app.listen(port,()=>{
    console.log(`example app listening on port ${port}`);
})