import axios from "axios";

let token = null;

if (typeof window !== "undefined") {
  token = JSON.parse(localStorage.getItem("token"));
}




const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

export const axiosInstance = async (method, url, reqBody = {}, headers) => {
  return await axios({
    method,
    url: `http://localhost:5000/api/${url}`,
    data: reqBody,
    headers: headers ? headers : { "Content-Type": "application/json" },
  });
};

export const makePrivateAPIcall = async (method, url, reqBody) => {
  await axiosInstance(method, url, reqBody, headers);
};
export const makePublicAPIcall = async (method, url, reqBody) => {
  await axiosInstance(method, url, reqBody);
};

// export const makePrivateGetAPIcall = (url) => {

//  useEffect(() => {
    
//  }, []);
// };

