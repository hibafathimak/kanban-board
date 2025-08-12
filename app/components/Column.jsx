import { useState } from "react";
import Card from "./Card";
import TaskForm from "./TaskForm";
import { Edit, PlusIcon, TrashIcon } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Input from "./Input";
import { makePrivateAPIcall } from "../utils/axiosInstance";
import category from "../api/category";
import { DELETE, PUT } from "../constants";

const Column = ({ heading, tasks, setFetchData }) => {
  const { setNodeRef } = useDroppable({ id: heading.id });
  const [displayForm, setDisplayForm] = useState(false);
  const [updatedTask, setUpdatedTask] = useState(null);
  const [displayEditInput, setDisplayEditInput] = useState(false);
  const [updatedColumn, setUpdatedColumn] = useState("");

  const editListName = async () => {
    if (updatedColumn.trim() === "") return;
    await makePrivateAPIcall(
      PUT,
      `${category.update}/${heading.id}`,
      { updatedCategory: updatedColumn },
      (res) => {
        setUpdatedColumn("")
        setDisplayEditInput(false);
        setFetchData(res);
      }
    );
  };

  const deleteCategory = async () => {
    await makePrivateAPIcall(
      DELETE,
      `${category.delete}/${heading.id}`,{},(res) => {
        setFetchData(res);
      }
    );
  };

  return (
    <div
      ref={setNodeRef}
      className="bg-[#262626] rounded-xl p-3 sm:p-4 h-fit group w-full sm:w-[280px] md:w-[290px] lg:w-[320px] sm:flex-shrink-0  group  max-h-[calc(100vh-140px)] overflow-y-hidden"
    >
      <div className="flex items-center justify-between">
        {displayEditInput ? (
          <div className="flex items-center gap-4">
            <Input
              value={updatedColumn}
              className="bg-[#323232] placeholder:text-[#878787]"
              onChange={(e) => setUpdatedColumn(e.target.value)}
            />
            <button
              onClick={editListName}
              className="bg-[#878787] p-2 cursor-pointer rounded-lg flex justify-center items-center"
            >
              Submit
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{heading.category}</h1>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Edit
                size={16}
                onClick={() => {
                  setUpdatedColumn(heading.category);
                  setDisplayEditInput(true);
                }}
                className="cursor-pointer"
              />
              <TrashIcon
                size={16}
                className="cursor-pointer"
                onClick={() => deleteCategory(heading.id)}
              />
              <PlusIcon
                size={20}
                onClick={() => setDisplayForm(!displayForm)}
                className="cursor-pointer"
              />
            </div>
          </>
        )}
      </div>

      <div className=" overflow-y-auto no-scroll max-h-[calc(100vh-200px)] ">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks?.length > 0 ? (
            tasks?.map((item, index) => {
              return (
                <Card
                  key={item.id}
                  taskDetails={item}
                  setDisplayForm={setDisplayForm}
                  editTask={() => setUpdatedTask(item)}
                  setFetchData={setFetchData}
                />
              );
            })
          ) : (
            <p className="my-2 font-light text-sm text-[#878787]">
              No Tasks Yet
            </p>
          )}
        </SortableContext>

        {displayForm && (
          <TaskForm
            setDisplayForm={setDisplayForm}
            category={heading.id}
            taskToEdit={updatedTask}
            setFetchData={setFetchData}
          />
        )}
      </div>
    </div>
  );
};

export default Column;
