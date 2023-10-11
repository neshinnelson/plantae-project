
export const hasApiKey = async(req,res,next)=>{
    const clientKey = req.query.apikey
    if(!clientKey) return res.json({response:'failed',message:'no apikey found'})
    clientKey === process.env.API_KEY ? next(): 
    res.status(404).json({response:'unauthorized',message:'wrong api key'})
    // next()
}