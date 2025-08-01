"use client";
import React, { useState } from "react";
import Input from "../components/Input";
import { useDispatch } from "react-redux";
import { login } from "../../store/userSlice";
import { useRouter } from "next/navigation";

const page = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = (e) => {
    if (!userData.email || !userData.name || !userData.password) return;
    e.preventDefault();
    dispatch(login(userData));
    router.push("/home");
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-[#262626] w-80 p-4 rounded-lg flex flex-col gap-4 items-center"
      >
        <h1 className="text-2xl">Login</h1>
        <Input
          placeholder="Name"
          type="text"
          value={userData.name}
          className="bg-[#323232]"
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        />

        <Input
          placeholder="Email"
          type="email"
          value={userData.email}
          className="bg-[#323232]"
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />
        <Input
          placeholder="Password"
          type="password"
          value={userData.password}
          className="bg-[#323232]"
          onChange={(e) =>
            setUserData({ ...userData, password: e.target.value })
          }
        />

        <button
          type="submit"
          className="text-sm rounded-lg p-2 w-full bg-[#6B6FF4] cursor-pointer"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default page;
