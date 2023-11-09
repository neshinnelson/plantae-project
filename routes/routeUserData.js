import express from 'express'
import ModelUserData from '../models/modelUserData.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import randomstring from 'randomstring'
import { hasApiKey } from '../middleware/checkApiKey.js'
import { checkBcrypt, checkQueryUser, checkUpdateAddress, issueToken, verifyAdminToken, verifyToken } from '../functions.module.js'

const router = express.Router()


// array to store refresh tokens
export const refreshTokens = []

// handle to fetch address, email bought items fullname
router.get('/:id',hasApiKey,async(req,res)=>{
    const userId = req.params.id
    //verifying client token
    const queryToken = req.query.token?req.body.token:''
    const authHeader = req.headers.authorization?req.headers['authorization'].split(' ')[1]:''
    const authToken = queryToken?queryToken:authHeader

    if(!authToken) return res.status(401).json({respose:'failed',message:'no token found !'})

    // hadle to get admin bought history
    if(req.params.id==='all-bought'){
    //checking wheather admin has token or not
    const hasToken = await verifyAdminToken(authToken)
    console.log(hasToken,'token');
    if(hasToken !== true) return res.status(401).json({
        response:'failed',message:'token is invalid or expired'}) 

        try{
            const find = await ModelUserData.find({},'boughtItems').select({_id:0,boughtItems:1}).exec()
            
            const data = find.map(itm=> (itm.boughtItems))
             .filter(itm=>itm.length>0)
            
            res.json({response:'success',message:'all bought items',data})
        }catch(err){
            console.log('error i fetching bought items');
            console.error(err);
        }
    }
    else{
        //verify client token 
    const hasToken = await verifyToken(authToken)
    // console.log(hasToken,'has token:');
    if(hasToken !== true) return res.status(401).json({response:'failed',message:'token is invalid or expired'})

        if(req.query){
            const searchParams = checkQueryUser(req.query.find)
            
            try{
                const data = await ModelUserData.find({userId},searchParams,{_id:0}).exec();

                const resData = searchParams==='address'?data[0].address:
                searchParams==='email'?data[0].email:
                searchParams==='boughtItems'?data[0].boughtItems:
                data[0].firstName + ' ' +data[0].secondName

        
                res.json({respone:'success',message:'query is fetched',data:data})
            }catch(err){
                console.log('unable to fetch data from db');
                console.error(err);
                res.status(406).json({respone:'failed',message:'query is wrong'})
            }
        }else{
            res.status(406).json({response:'failed',message:'query not found!'})
        }
    }
        
})



// user registration handle
router.post('/',hasApiKey,async(req,res)=>{

     //checking wheather userExist or not
     let userExists =  await ModelUserData.find({userName: req.body.userName})
     if(userExists.length > 0) return res.status(406).json({response:'failed', message:'duplicate err!!,username already exist!'})
    
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    const test = regEx.test(req.body.password)
    if(!test) return res.status(406).json({response:'failed',message:'password should contain at least one capital,one small,one special charecter,one number and should be atleast 8 charecter long'})

    if(req.body.userName.length > 8 && test){

       try{
         // hashing the password using bcrypt
         const hashedPass = await bcrypt.hash(req.body.password,10)
 
         const data =  new ModelUserData(req.body)
         data.password = hashedPass
         data.firstName = data.firstName.toLowerCase()
         data.secondName = data.secondName.toLowerCase()
         data.userId = randomstring.generate()+Math.random()

         await data.save();
 
         res.json({response:'success',message:'data posted to db'})
         console.log('data posted to db');

       }catch(err){
        console.log('client err !');
        console.error(err);
        let errMessage = err.code===11000?'duplicate err!!,username or password or email already exist!':
        'check data entered, client error !'
        res.status(406).json({response:'failed',message:errMessage})
       }
    }else{
        console.log('user name is less than 8 or other uncatch error !');
        res.status(406).json({response:'failed',message:'user name is less than 8 or other uncatch error !'})
    }
   
})

// user login handle 
router.post('/authorise',hasApiKey, async(req,res)=>{
    //checking req.body exists ?
    if(!req.body.userName && !req.body.password) { 
        return res.status(406).json({
        response:'failed',message:'username or password is missing'
    }) 
}console.log(req.body);
    if(req.body.userName.length<8||req.body.password<8){
        return res.status(406).json({response:'failed', message:'username or password is incorrect or missing!'})
    }

    
    //checking wheather userExist or not
    let data =  await ModelUserData.find({userName: req.body.userName})
    if(data.length===0||null) return res.status(404).json({response:'failed', message:'username is not found'})

    
    // check if password is wrong
    const checkPass = await checkBcrypt(req.body.password,data[0].password)
    !checkPass&& res.status(401).json({response:'failed',message:'password is wrong'})

    if(data[0].userName===req.body.userName && checkPass){
       try{
         // issueing a jwt tockent to user
         const tokens = await issueToken(data[0].userName)
         !tokens||null&& res.status(500).json({response:'failed',message:'sorry server busy !!'})
 
         // setting isActive true in DB
         const setActive = await ModelUserData.findByIdAndUpdate(data[0]._id,{isActive:true},{new:true})
        
         const userDetails = {
            userId : data[0].userId,
            userName : data[0].userName,
            fullName : data[0].firstName +' ' + data[0].secondName
        }
        res.cookie('token',tokens.token, { domain: 'localhost', path: '/', secure: true, httpOnly: true })
         res.json({response:'success',message:'user is active for 60s',userDetails,tokens:tokens})

       }catch(err){
        console.log('error issuing token or setting user isActive');
        console.error(err);

        res.status(500).json({response:'failed',message:'error issuing token or setting user isActive'})
       }
    }
    

  
})

//update user address handle
router.put('/:id',hasApiKey,async(req,res)=>{
    
    //verifying client token
    const queryToken = req.query.token?req.query.token : ''
    const authHeader = req.headers.authorization?req.headers['authorization'].split(' ')[1] : ''
    const authToken = queryToken?queryToken:authHeader

    if(!authToken) return res.status(401).json({respose:'failed',message:'no token found !'})
    //verify token
    const hasToken = await verifyToken(authToken)
    // console.log(hasToken,'has token:');
    if(hasToken !== true) return res.status(401).json({response:'failed',message:'token is invalid or expired'})

    //check wheather address is empty or not
    const isReqExist = await checkUpdateAddress(req.body)
    // console.log(isReqExist,': address exist or not');
    if(!isReqExist) return res.status(406).json({response:'failed',message:'all field of address is required'})
    
   try{
    // geting userId
    const userId = req.params.id
    const update = req.body
    
    //finding user
    const find = await ModelUserData.find({userId: userId})
    if(!find) return res.status(404).json({response:'failed',message:'not a registered user'})

    //update user address
    console.log(find);
    const data = await ModelUserData.findByIdAndUpdate(find[0]._id,{address:update},{new:true},{_id:0}).exec()
    
    res.json({response:'success',message:'user data updated',updated:data.address})
   }catch(err){
    console.log('error updating userdata');
    console.error(err);
    res.status(500).json({response:'failed',message:'oops! server error! please try again in one minute'})
   }
})

router.put('/bought-items/:id',hasApiKey,async(req,res)=>{
    if(Object.keys(req.body).length < 1)return res.status(404).json({
        response:'failed',message:'no query found'
    })
    const userId = req.params.id
    const newProducts = req.body.boughtItems
    // console.log(req.body);
    console.log(newProducts);
    try{
        const find = await ModelUserData.find({userId:userId},'boughtItems',{_id:0})
        .select({_id:0})
        .exec()
        console.log(find);
        if(!find||find.length<1)return  res.status(404).json({
            response:'failed',message:'no user found'
        })
        const newObj = {
            time: new Date,
            productId:''
        }
        if(find[0].boughtItems){
           const newArr = []
           const update = newProducts.map(id=>({time : new Date,productId:id}))
           console.log(update);
           console.log(newArr);
           const updatedArr = find[0].boughtItems.concat(update)

            try{
                const data = await ModelUserData.updateOne({userId:userId},{boughtItems:updatedArr}).exec()
                res.json({response:'success',message:'updated boughtitems',data})
            }catch(err){
                console.log('error in updating to bought items');
                console.error(err);
            }
        }
       
        // const existingArr = [...find[0].boughtItems.productArr]
        // console.log(existingArr,'exist');
    //     const update = newProducts.map(id=> newObj.productArr.push(id))
    //     console.log(update);
    //     console.log(newObj);
    }catch(err){
        console.log('error in updating to bouught items');
        console.error(err);
    }
})

// admin log in handle
//userName & password
router.post('/admin-login',hasApiKey,async(req,res)=>{
    //checking req.body exists ?
    (!req.body.userName && !req.body.password) && res.status(406).json({
        response:'failed',message:'username or password is missing'
    })
    if(req.body.userName !== 'neshinnelson') return res.status(401).json({
        response:'failed',message:'unathorized access'
    })

    //checking username from db
        const findUser = await ModelUserData.find({userName:req.body.userName})
        console.log(findUser,': find user');
        if(!findUser||findUser.length===0) {
            return res.status(404).json({response:'failed',message:"admin username doesn't exist"})
        }
   

    //varifying password
    const verifyPass = await checkBcrypt(req.body.password,findUser[0].password)
    if(!verifyPass) return res.status(406).json({response:'failed',message:"admin password is wrong"})

    //issue token & setting admin true in db
    const token = jwt.sign(
        {username:findUser[0].username},process.env.JWT_ADMIN_SECRET_KEY,{expiresIn:'300s'})
        if(!token||token===null||token===null){
            return res.status(500).json({response:'failed',message:"server error in jwt"})
        }
        try{
            const isActive = await ModelUserData.findByIdAndUpdate(findUser[0]._id,{admin:true},{_id:0})
        }catch(err){
            console.log('error in setting admin true');
            console.error(err);
        }

        const resData = {username:findUser[0].userName,userId:findUser[0].userId}
        res.json({response:'success',resData,token})
})

export default router