import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axiosInstance";

const useFetchData = (url) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = JSON.parse(localStorage.getItem("token"));
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      try {
        const response = await axiosInstance("GET", url, {}, headers);
        if (response?.status === 200) {
          setData(response?.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [url]);

  return data;
};

export default useFetchData;
