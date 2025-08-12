import axios from "axios";

let token = null;

if (typeof window !== "undefined") {
  token = JSON.parse(localStorage.getItem("token"));
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

export const axiosInstance = async (
  method,
  url,
  reqBody = {},
  headers,
  successCallback = () => {},
  errorCallback = () => {}
) => {
  // debugger
  try {
    const response = await axios({
      method,
      url: `http://localhost:5000/api/${url}`,
      data: reqBody,
      headers: headers ? headers : { "Content-Type": "application/json" },
    });
    if (response.status >= 200 && response.status < 300) {
      successCallback(response);
    }
    return response;
  } catch (error) {
    console.log(error);
    errorCallback(error)
  }
};

export const makePrivateAPIcall = async (
  method,
  url,
  reqBody,
  successCallback,
  errorCallback
) => {
  return await axiosInstance(
    method,
    url,
    reqBody,
    headers,
    successCallback,
    errorCallback
  );
};
export const makePublicAPIcall = async (
  method,
  url,
  reqBody,
  successCallback,
  errorCallback
) => {
  return await axiosInstance(
    method,
    url,
    reqBody,
    { "Content-Type": "application/json" },
    successCallback,
    errorCallback
  );
};
