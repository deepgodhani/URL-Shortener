const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const UserModel = require("../Models/User").UserModel;
const UrlModel = require("../Models/Url").UrlModel;
const dotenv = require("dotenv");

const signup = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await UserModel.findOne({ email });
        if(user){
            return res.status(409).json({ message: "User already exists" });
        }
        const userData = new UserModel({
            name,
            email,
            password
        });
        userData.password = await bcrypt.hash(password, 10);
        await userData.save();
        res.status(201).json({ message: "User registered successfully",success: true });
    }
    catch (error){
        console.log("Error in signup", error);
        res.status(500).json({ message: "Internal server error" ,succcess: false});
    }
}

const login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await UserModel.findOne({ email });
        const errMsg = "Invalid email or password";
        if(!user){
            return res.status(403).json({ message: errMsg });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(403).json({ message: errMsg });
        }
        const jwtToken = jwt.sign({email : user.email , _id : user._id},
            process.env.JWT_SECRET, {expiresIn: "24h"}
        );


        res.status(201).json({ message: "login successfully",
            success: true ,
            jwtToken,
            email,
            name: user.name,
        });
    }
    catch (error){
        console.log("Error in signup", error);
        res.status(500).json({ message: "Internal server error" ,succcess: false});
    }
}

const shorten = async (req, res) => {
    const {originalUrl , email} = req.body;

    let shortUrl = nanoid(6);
    
    if(!originalUrl){
        return res.status(400).json({message: "bad request"});
    }
    try{
        const existing = await UrlModel.findOne({ originalUrl });
        if(existing){
            shortUrl = existing.shortUrl;
        }
        const urlData = new UrlModel({
            originalUrl,
            shortUrl,
            email
        });
        await urlData.save();
        console.log("urlData", urlData);
        console.log("shortUrl", shortUrl);
        res.status(201).json({message: "url shortened successfully", shortUrl});

    }
    catch(error){
        console.log("Error in shortening url", error);
        res.status(500).json({message: "internal server error"});
    }
}

module.exports = {
    signup,
    login,
    shorten
}

