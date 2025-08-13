import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axiosInstance";
import { GET } from "../constants";
import Cookies from "js-cookie";

const useFetchData = (url, refetchFlags) => {
  const [data, setData] = useState(null);
  const fetchData = async () => {
    // const token = JSON.parse(localStorage.getItem("token"));
    const token = Cookies.get("token")
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      await axiosInstance(GET, url, {}, headers, (res) => {
        setData(res?.data);
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [url, refetchFlags]);

  return data;
};

export default useFetchData;
