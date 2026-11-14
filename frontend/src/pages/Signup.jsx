import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { authDataContext } from "../Context/AuthContext";
import axios from "axios"
import { userDataContext } from "../Context/UserContext";

export default function Signup() {
const [show, setShow] = useState(false);
let {serverUrl}=useContext(authDataContext);

let {userData, setUserData}=useContext(userDataContext)

const navigate = useNavigate();
const [firstName, setFirstName]=useState("")
const [lastName, setLastName] = useState("");
const [userName, setUserName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading]= useState(false)
const [err, setErr]=useState("")
const handleSignUp = async (e)=>{
  e.preventDefault()
  setLoading(true)
try{
let result = await axios.post(serverUrl+"/api/auth/signup",{
firstName,
lastName,
userName,
email,
password

},{withCredentials:true})
setErr("")
console.log(result);
setUserData(result.data)
navigate("/")
setErr("")
setLoading(false)
setFirstName("")
setLastName("")
setEmail("")
setPassword("")
setUserName("")
}catch(error){
 setErr(error.response.data.message)
 setLoading(false)
}
}
  return (
    <div className="w-full min-h-screen bg-[#8a8ac2] pb-[40px] flex flex-col items-center justify-start gap-[10px]">
      <div className="p-[35px] lg:p-[35px] w-full h-[80px] flex items-center">
        <img src={logo} alt="logo" />
      </div>

      <form className="w-[90%] max-w-[400px] bg-white shadow-lg rounded-lg p-[25px] flex flex-col gap-[15px]" onSubmit={handleSignUp}>
        <h1 className="text-[28px] font-semibold text-gray-800">Sign Up</h1>

        <input
          type="text"
          placeholder="Firstname"
          required
          className="w-full h-[45px] border-2 border-gray-600 rounded-md px-[10px] text-[14px] outline-none"
          value={firstName}
          onChange= {
          (e)=>setFirstName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Lastname"
          required
          className="w-full h-[45px] border-2 border-gray-600 rounded-md px-[10px] text-[14px] outline-none"
        value={lastName}
          onChange= {
          (e)=>setLastName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Username"
          required
          className="w-full h-[45px] border-2 border-gray-600 rounded-md px-[10px] text-[14px] outline-none"
       
        value={userName}
          onChange= {
          (e)=>setUserName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full h-[45px] border-2 border-gray-600 rounded-md px-[10px] text-[14px] outline-none"
          value={email}
          onChange= {
          (e)=>setEmail(e.target.value)}
        />

        <div className="relative w-full">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            required
            className="w-full h-[45px] border-2 border-gray-600 rounded-md px-[10px] pr-[60px] text-[14px] outline-none"
           value={password}
          onChange= {
          (e)=>setPassword(e.target.value)}
          />
          <span
            onClick={() => setShow(!show)}
            className="absolute right-[12px] top-[11px] text-[#2a8bdc] font-semibold text-[14px] cursor-pointer select-none"
          >
            {show ? "Hide" : "Show"}
          </span>
        </div>
          {err && <p className="text-center text-red-500">{err}</p>}
        <button
          type="submit"
          className="w-full h-[48px] mt-[20px] bg-[#2a8bdc] text-white rounded-full text-[14px] font-medium"
        disabled ={loading}
        >
          {loading ?"loading..." :"Sign Up"}
        </button>
       
        <p className="text-center text-[13px] font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-[#2a8bdc] font-semibold">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}




