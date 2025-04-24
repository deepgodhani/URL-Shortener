const joi = require("joi");


const signupValidation = (req,res,next) => {
    const schema = joi.object({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(4).max(20).required()
    })
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400).json({message:"bad request",error}) 
    }
    next()
}

const loginValidation = (req,res,next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(4).max(20).required()
    })
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400).json({message:"bad request",error}) 
    }
    next()
}

const shortenValidation = (req,res,next) => {   
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Authentication token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Populate req.user with decoded token data
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = {  
    signupValidation,
    loginValidation,
    shortenValidation
}