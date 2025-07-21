import React from "react";
import Input from "./Input";

const ColorInput = ({ value, onChange }) => {
    return (
      
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 top-2 cursor-pointer"
        />
        <div
          className="w-10 h-10 rounded cursor-pointer"
          style={{ backgroundColor: value }}
        ></div>
      </div>

  );
};

export default ColorInput;
