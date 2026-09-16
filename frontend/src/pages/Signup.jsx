
import React, { useContext, useState } from "react";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { userDataContext } from "../context/UserContext";

const Signup = () => {
  const [show, setShow] = useState(false);

  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userData, setUserData } = useContext(userDataContext);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          firstName,
          lastName,
          userName,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result.data);
      setUserData(result.data.user);
      setFirstName("");
      setLastName("");
      setUserName("");
      setEmail("");
      setPassword("");

      // Redirect after successful signup
      navigate("/");
    } catch (error) {
      setError(
        error?.result?.data?.message || "Something went wrong. Please try again."
      );

      console.log(error?.result?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center">
      {/* Logo */}
      <div className="w-full h-20 px-8 flex items-center">
        <img src={logo} alt="LinkedIn Logo" className="w-32" />
      </div>

      {/* Signup Form */}
      <form
        onSubmit={handleSignUp}
        className="w-[90%] max-w-md bg-white md:shadow-xl rounded-lg p-6 flex flex-col gap-4"
      >
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
          Sign Up
        </h1>

        <input
          type="text"
          placeholder="First Name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full h-12 border border-gray-400 rounded-md px-4 text-gray-800 outline-none focus:border-blue-600"
        />

        <input
          type="text"
          placeholder="Last Name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full h-12 border border-gray-400 rounded-md px-4 text-gray-800 outline-none focus:border-blue-600"
        />

        <input
          type="text"
          placeholder="Username"
          required
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full h-12 border border-gray-400 rounded-md px-4 text-gray-800 outline-none focus:border-blue-600"
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 border border-gray-400 rounded-md px-4 text-gray-800 outline-none focus:border-blue-600"
        />

        {/* Password */}
        <div className="relative w-full">
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 border border-gray-400 rounded-md px-4 pr-16 text-gray-800 outline-none focus:border-blue-600"
          />

          <span
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 font-medium cursor-pointer select-none"
          >
            {show ? "Hide" : "Show"}
          </span>
        </div>

        {err && (
          <p className="text-red-500 text-sm text-center">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-800 transition duration-300 rounded-full text-white font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>

        <p className="text-center text-gray-700">
          Already have an account?
          <span
            onClick={() => navigate("/login")}
            className="ml-2 text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
