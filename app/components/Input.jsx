import React from "react";

const Input = ({ placeholder, onChange = () => {},value ,className }) => {
  return (
    <input
      onChange={onChange}
      type="text"
      name={placeholder}
      className={` rounded-lg py-2 px-4 w-full outline-0 ${className}`}
      value={value? value :""}
      placeholder={placeholder}
    />
  );
};

export default Input;
