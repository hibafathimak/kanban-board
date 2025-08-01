"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const Page = () => {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard"); 
    } else {
      router.replace("/login"); 
    }
  }, [user]);

  return null; 
};

export default Page;
