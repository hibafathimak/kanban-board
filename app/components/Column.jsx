import { useState } from "react";
import Card from "./Card";
import TaskForm from "./TaskForm";
import { PlusIcon } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const Column = ({
  heading,
  tasks,
  deleteTask,
  addTask,
  editTask,
  updatedTask,
  setUpdatedTask,
}) => {
  const [displayForm, setDisplayForm] = useState(false);
  const { setNodeRef } = useDroppable({ id: heading });
  return (
    <div ref={setNodeRef} className="bg-[#262626]  rounded-2xl p-4 h-fit group">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <button
          onClick={() => {
            setDisplayForm(!displayForm);
          }}
          className="bg-[#878787] h-5 w-5 cursor-pointer rounded-full flex justify-center items-center opacity-0 group-hover:opacity-100"
        >
          <PlusIcon />
        </button>
      </div>
      <div>
        <SortableContext  items={tasks.map((task) => task.id)}  strategy={verticalListSortingStrategy}>
          {tasks?.length > 0 ? (
            tasks?.map((item, index) => (
              <Card
                key={index}
                taskDetails={item}
                deleteTask={deleteTask}
                setDisplayForm={setDisplayForm}
                editTask={() => setUpdatedTask(item)}
              />
            ))
          ) : (
            <p className="my-2 font-light text-sm">No Tasks Yet</p>
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
