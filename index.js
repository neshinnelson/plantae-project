import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import 'dotenv/config'

//importing routes
import routeAllPlants from './routes/routeAllPlants.js'
import routeUserData from './routes/routeUserData.js'
import routeCategory from './routes/routeCategory.js'
import routeCart from './routes/routeCart.js'
import routeWhishlist from './routes/routeWhishlist.js'

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

//middleware
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

app.get('/',(req,res)=>{
    // res.send('<h1>Neshin Nodejs Developer</h1>')
    res.render('index.ejs')
})

app.use('/plants',routeAllPlants);
app.use('/user-data',routeUserData);
app.use('/category',routeCategory);
app.use('/cart',routeCart);
app.use('/wishlist',routeWhishlist);


app.listen(port,()=>{
    console.log(`example app listening on port ${port}`);
})