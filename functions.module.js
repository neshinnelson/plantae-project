import jwt from 'jsonwebtoken'
import {refreshTokens} from './routes/routeUserData.js'
import bcrypt from 'bcrypt'



// generating token for authorization
export const issueToken = async(clientUserName)=>{
    const secretKey = process.env.JWT_SECRET_KEY
    const refreshKey = process.env.JWT_REFRESH_KEY
    const payload = {userName:clientUserName}
    //create token
    try{
        const token = jwt.sign(payload,secretKey,{expiresIn:'300s'})
        const refreshToken = jwt.sign(payload,refreshKey)
        refreshTokens.push(refreshToken)
        return {token,refreshToken}
    }catch(err){
        console.log('jwt server error');
        console.error(err);
    }
}

// verifying issued jwt token / client token
export const verifyToken = async(token)=>{
    if(!token) return 'no token found !'

    try{
        const checkJwt = jwt.verify(token,process.env.JWT_SECRET_KEY,(err)=>{
                        if(err) return err
                        return true
        })
        return checkJwt
    }catch(err){
        console.log('jwt error');
        console.error(err);
    }
}

// verifying issued jwt token ADMIN
export const verifyAdminToken = async(token)=>{
    if(!token) return 'no token found !'

    try{
        const checkJwt = jwt.verify(token,process.env.JWT_ADMIN_SECRET_KEY,(err)=>{
                        if(err) return err
                        return true
        })
        return checkJwt
    }catch(err){
        console.log('jwt error');
        console.error(err);
    }
}

//checking hashed password using bcrypt
export const checkBcrypt =async(ClientPass,dbPass)=>{
    try{
    const result = await bcrypt.compare(ClientPass,dbPass)
    return result
    }catch(err){
        console.log('bcrypt server error !');
        console.error(err);
    }
}

//checking wheather address is there while updating user-data
export const checkUpdateAddress = async(address)=>{
    // console.log(address);
    let result
    if (address.phone && address.shippingAddress &&
         address.firstName && address.secondName &&
         address.state && address.country) {
         result = true
    }else{
         result = false
    }
    return result
}

// checking search query in get route /user-data/:id
export const checkQueryUser = (query)=>{
    console.log(query);
    let result
    switch (query) {
        case "address":
            result = 'address'
            break;
        case "boughtItems":
            result = 'boughtItems'
            break    
        case "email":
            result = 'email'        
            break
        default:
            result = 'firstName secondName'
            break;
    }
    return result
}

// checking search query in get route /plants/:id
export const checkQueryPlant = (query)=>{ 


   if(query.category){
            return {category:query.category}                
   }

   else if (query.name){
           return {name:query.name}
   }

   else if(query.price){
    if(query.price === '<500') return {price: { $lt:500 }}
      else if(query.price === '<1000') return {price: {$gt : 499, $lt : 1000 }}
        else if (query.price === '>1000') return {price: { $gt:999 }}
   }

   else if(query.rating){
            return {rating: query.rating}
   }

   else if(query.stock){
            return {rating: query.stock}
   }
   else if(query.plantId){
    return {plantId: query.plantId}
}
   else {
            return {}
   }
}