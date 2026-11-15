import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.svg";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";

function Login() {
  const [show, setShow] = useState(false);
  const { serverUrl } = useContext(authDataContext);
 let{userData, setUserData}=useContext(userDataContext)
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await axios.post(
        serverUrl + "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setUserData(result.data);
      setErr("");
      setLoading(false);
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      setErr(error.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-[45px] border-2 border-gray-600 rounded-md px-[10px] text-[14px] outline-none";

  return (
    <div className="w-full min-h-screen bg-[#8a8ac2] pb-[40px] flex flex-col items-center justify-start gap-[10px]">
      <div className="p-[35px] lg:p-[35px] w-full h-[80px] flex items-center">
        <img src={logo} alt="logo" />
      </div>

      <form
        onSubmit={handleSignIn}
        className="w-[90%] max-w-[400px] bg-white shadow-lg rounded-lg p-[25px] flex flex-col gap-[15px]"
      >
        <h1 className="text-[28px] font-semibold text-gray-800">Login</h1>

        <input
          type="email"
          placeholder="Email"
          required
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative w-full">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            required
            className={inputClass + " pr-[60px]"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          disabled={loading}
          className="w-full h-[48px] mt-[20px] bg-[#2a8bdc] text-white rounded-full text-[14px] font-medium"
        >
          {loading ? "loading..." : "Login"}
        </button>

        <p className="text-center text-[13px] font-medium">
          Want to create an account?{" "}
          <Link to="/signup" className="text-[#2a8bdc] font-semibold">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
