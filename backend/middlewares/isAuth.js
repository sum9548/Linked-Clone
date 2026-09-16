import jwt from "jsonwebtoken";

const isAuth = (req, res, next) =>{
    try {
        const {token} = req.cookies;
        // console.log("token is",token)
        if(!token){
            return res.status(400).json({message:"user doesn't have token"})
        }

        const verifytoken = jwt.verify(token,process.env.JWT_SECRET);
        if(!verifytoken){
            return res.status(400).json({message:"user doesn't have valid token"})
        }
        // console.log("verified token ",verifytoken);
        req.userId = verifytoken.userId;
        next()
    } catch (error) {
        return res.status(500).json({message:"is auth error"})
    }
}

export default isAuth;