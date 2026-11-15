import genToken from "../config/token.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs";

//signup part
export const signUp = async (req, res)=>{
try{
const { firstName, lastName, userName, email, password } = req.body
// Email already exists
let existEmail= await User.findOne({ email });
if (existEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // 3. Username already exists
    const existUsername = await User.findOne({ userName });
    if (existUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    // 4. Password length check
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }
    // 5. Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
   // create user and save
   const user = await User.create({
    firstName,
    lastName,
    userName,
    email,
    password: hashedPassword,
   });

   let token = await genToken(user._id)
   res.cookie("token", token,{
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production"
   })
   return res.status(201).json(user)

}catch(error){
console.log("Signup error:", error);
  return res.status(500).json({ message: "Signup error" });
}
}
//login part
export const login= async(req,res)=>{
try{
const {email, password } = req.body
// Email already exists
let user= await User.findOne({ email });
if (!user) {
      return res.status(400).json({ message: "user does't exists" });
    }
    
   let isMatch= await bcrypt.compare(password,user.password)
   if(!isMatch){
    return res.status(400).json({message:"password incorrect"})
   }

   let token = await genToken(user._id)
   res.cookie("token", token,{
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
   secure: process.env.NODE_ENV === "production"
   })
   return res.status(200).json(user)
}catch(error){
    console.log(error);
     return res.status(500).json({message:"login error"})
}
}
// logout part
export const logout = async (req, res)=>{

try {
    res.clearCookie("token", {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production"
});
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }

}
