const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    const auth= req.headers['authorization'];
    console.log("auth", auth);
    if(!auth){
        return res.status(403).json({message:"Unauthorized ,jwt token not found"});
    }
    try{
        const decoded = jwt.verify(auth, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(error){
        console.log("Error in authentication", error);
        return res.status(403).json({message:"Unauthorized , invalid jwt token",auth});
    }
}

module.exports = ensureAuthenticated;