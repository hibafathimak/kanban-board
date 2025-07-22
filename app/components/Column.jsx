import { useState } from "react";
import Card from "./Card";
import TaskForm from "./TaskForm";
import { Edit, PlusIcon } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Input from "./Input";

const Column = ({
  heading,
  tasks,
  deleteTask,
  addTask,
  editTask,
  updatedTask,
  setUpdatedTask,
  setUpdatedColumn,
  editListName,
  updatedColumn,
}) => {
  const [displayForm, setDisplayForm] = useState(false);
  const [displayEditInput, setDisplayEditInput] = useState(false);

  const { setNodeRef } = useDroppable({ id: heading });
  return (
    <div
      ref={setNodeRef}
      className="bg-[#262626]  rounded-2xl p-4 h-fit group min-w-[290px] max-h-[calc(100vh-140px)] overflow-y-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {displayEditInput ? (
            <>
              <Input
                value={updatedColumn ? updatedColumn : heading}
                className="bg-[#323232]  placeholder:text-[#878787]"
                onChange={(e) => setUpdatedColumn(e.target.value)}
              />
              <button
                onClick={() => {
                  editListName();
                  setDisplayEditInput(false)
                }}
                className="bg-[#878787] p-2  cursor-pointer rounded-lg flex justify-center items-center "
              >
                submit
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{heading}</h1>
              <Edit
                size={20}
                onClick={() => setDisplayEditInput(!displayEditInput)}
                className="cursor-pointer"
              />
            </>
          )}
        </div>
        {!displayEditInput && (
          <button
            onClick={() => {
              setDisplayForm(!displayForm);
            }}
            className="bg-[#878787] h-5 w-5 cursor-pointer rounded-full flex justify-center items-center opacity-0 group-hover:opacity-100"
          >
            <PlusIcon />
          </button>
        )}
      </div>
      <div className=" overflow-y-auto no-scroll max-h-[calc(100vh-200px)] ">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks?.length > 0 ? (
            tasks?.map((item, index) => (
              <Card
                key={item.id}
                taskDetails={item}
                deleteTask={deleteTask}
                setDisplayForm={setDisplayForm}
                editTask={() => setUpdatedTask(item)}
              />
            ))
          ) : (
            <p className="my-2 font-light text-sm text-[#878787]">No Tasks Yet</p>
          )}
        </SortableContext>

        {displayForm && (
          <TaskForm
            setDisplayForm={setDisplayForm}
            addTask={addTask}
            category={heading}
            taskToEdit={updatedTask}
            editTask={editTask}
          />
        )}
      </div>
    </div>
  );
};

export default Column;
