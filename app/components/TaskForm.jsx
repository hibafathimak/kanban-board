import React, { useEffect, useState } from "react";
import Input from "./Input";
import ColorInput from "./ColorInput";

const TaskForm = ({
  setDisplayForm,
  category,
  addTask,
  taskToEdit,
  editTask,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "",
    category,
    color: "#ffffff",
  });

  useEffect(() => {
    if (taskToEdit) {
      setFormData(taskToEdit);
    }
  }, [taskToEdit]);
  console.log(formData);
  const handleSubmit = (e) => {
    e.preventDefault();

    if (taskToEdit) {
      editTask(formData);
    } else {
      addTask(formData);
    }
    setDisplayForm(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#414141] rounded-lg p-2 mt-4">
      {[
        { title: "Title", key: "title" },
        { title: "Description", key: "description" },
        { title: "Tag", key: "tag" },
      ].map((item, index) => (
        <Input
          key={index}
          placeholder={item.title}
          value={formData[item.key]}
          onChange={(e) => {
            setFormData({ ...formData, [item.key]: e.target.value });
          }}
          className="bg-[#323232]  placeholder:text-[#878787] mb-2 "
        />
      ))}
      <div className="flex items-center mb-2 gap-4">
        <Input
          type="text"
          placeholder="Color Hex"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          className="flex-1 bg-[#323232]  placeholder:text-[#878787]"
        />

        <ColorInput
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </div>
      <button
        type="submit"
        className="text-sm rounded-lg p-2 w-full bg-[#6B6FF4] cursor-pointer"
      >
        Submit
      </button>
    </form>
  );
};

export default TaskForm;
