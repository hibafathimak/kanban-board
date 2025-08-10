"use client";
import React, { useState } from "react";
import Input from "../components/Input";
import { useDispatch } from "react-redux";
import { login } from "../../store/userSlice";
import { useRouter } from "next/navigation";
import axios from "axios";

const AuthPage = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);

  const handleSubmit = async (e) => {
    // debugger;
    if (!userData.email || !userData.password) return;
    e.preventDefault();
    let response;
    if (isSignIn) {
      response = await axios.post("http://localhost:5000/api/users/login", {
        email: userData.email,
        password: userData.password,
      });
      if (response.status === 200) {
        localStorage.setItem("token", JSON.stringify(response.data.token));
        dispatch(login(userData));
        router.push("/home");
      }
    } else {
      response = await axios.post("http://localhost:5000/api/users/register", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
      });
      if (response.status === 200) {
        setIsSignIn(false)
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#262626]  rounded-2xl shadow-lg p-6 space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-[#6B6FF4]">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h2>

        {!isSignIn && (
          <>
            <Input
              placeholder="First Name"
              type="text"
              value={userData.firstName}
              className="bg-[#323232]"
              onChange={(e) =>
                setUserData({ ...userData, firstName: e.target.value })
              }
            />
            <Input
              placeholder="Last Name"
              type="text"
              className="bg-[#323232]"
              value={userData.lastName}
              onChange={(e) =>
                setUserData({ ...userData, lastName: e.target.value })
              }
            />
          </>
        )}

        <Input
          placeholder="Email"
          type="email"
          className="bg-[#323232]"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />

        <Input
          placeholder="Password"
          type="password"
          className="bg-[#323232]"
          value={userData.password}
          onChange={(e) =>
            setUserData({ ...userData, password: e.target.value })
          }
        />

        <button
          type="submit"
          className="w-full bg-[#6B6FF4] text-white font-semibold py-2 rounded-lg cursor-pointer"
        >
          {isSignIn ? "Login" : "Register"}
        </button>

        <p className="text-center text-sm text-gray-600">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <span
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-[#6B6FF4] font-semibold cursor-pointer"
          >
            {isSignIn ? " Sign Up" : " Sign In"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
