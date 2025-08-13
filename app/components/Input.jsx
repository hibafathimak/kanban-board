import React from "react";

const Input = ({
  placeholder,
  name,
  onChange = () => {},
  value,
  className,
  type,
  register
}) => {
  return (
    <input
      onChange={onChange}
      type={type ? type : "text"}
      name={name}
      className={` rounded-lg py-2 px-4 w-full outline-0 ${className}`}
      value={value ? value : ""}
      placeholder={placeholder}
      {...register(name)}
    />
  );
};

export default Input;
