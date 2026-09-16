import React, { useContext, useState } from "react";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { userDataContext } from "../context/UserContext";

const Login = () => {
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userData, setUserData } = useContext(userDataContext);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result.data);

      setEmail("");
      setPassword("");
      setUserData(result.data.user);
      // Redirect after successful login
      navigate("/");
    } catch (error) {
      setError(
        error?.result?.data?.message ||
          "Something went wrong. Please try again."
      );

      console.error(error?.result?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center">
      {/* Logo */}
      <div className="w-full h-20 px-8 flex items-center">
        <img src={logo} alt="Logo" className="w-32" />
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="w-[90%] max-w-md bg-white md:shadow-xl rounded-lg p-6 flex flex-col gap-4"
      >
        <h1 className="text-3xl font-semibold text-gray-800">
          Sign In
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 border border-gray-400 rounded-md px-4 outline-none focus:border-blue-600"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 border border-gray-400 rounded-md px-4 pr-16 outline-none focus:border-blue-600"
          />

          <span
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-blue-600 font-medium"
          >
            {show ? "Hide" : "Show"}
          </span>
        </div>

        {/* Error */}
        {err && (
          <p className="text-red-500 text-sm text-center">
            {err}
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* Signup Link */}
        <p className="text-center text-gray-700">
          Don't have an account?
          <span
            onClick={() => navigate("/signup")}
            className="ml-2 text-blue-600 cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;