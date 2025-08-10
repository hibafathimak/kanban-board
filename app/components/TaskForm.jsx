import React, { useEffect, useState } from "react";
import Input from "./Input";
import ColorInput from "./ColorInput";
import axios from "axios";
import { makePrivateAPIcall } from "../utils/axiosInstance";

const TaskForm = ({ setDisplayForm, category, taskToEdit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "",
    category,
    color: "#ffffff",
  });
  const [updatedTask, setUpdatedTask] = useState(null);
  const token = JSON.parse(localStorage.getItem("token"));

  const handleAddTask = async (task) => {
    // const id = Date.now() + Math.floor(Math.random() * 100);
    // console.log(task);
    const response = await makePrivateAPIcall("POST",
      "tasks/create-task",
      task,
    );
    // console.log(response);
  };

  const handleEditTask = async (updatedTask) => {
    const response = await makePrivateAPIcall("PUT",
      `tasks/update-task/${updatedTask.id}`,
      updatedTask,
    );
    console.log(response)
    setUpdatedTask(null);
  };
  useEffect(() => {
    if (taskToEdit) {
      setFormData(taskToEdit);
    }
  }, [taskToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() === "") return;

    if (taskToEdit) {
      handleEditTask(formData);
    } else {
      handleAddTask(formData);
    }
    setDisplayForm(false);
  };

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e);
      }}
      className="bg-[#414141] rounded-lg p-2 mt-4"
    >
      {[
        { title: "Title", key: "title" },
        { title: "Description", key: "description" },
        { title: "Tag", key: "tag" },
      ].map((item, index) => (
        <Input
          key={item.key}
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
