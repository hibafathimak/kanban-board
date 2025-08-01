"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import Column from "../components/Column";
import FilterBar from "../components/FilterBar";
import Card from "../components/Card";
import { PlusIcon } from "lucide-react";
import Input from "../components/Input";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useSelector((state) => state.user);
  console.log(user);

  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user]);
  
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Twilio integration",
      description:
        "Create new note via SMS. Support text, audio, links, and media.",
      category: "Backlog",
      tag: "",
      color: "#C340A1",
    },
    {
      id: 2,
      title: "Task 2",
      description: "Markdown shorthand converts to formatting",
      category: "Backlog",
      tag: "New Note",
      color: "#6A6DCD",
    },
    {
      id: 3,
      title: "Tablet view",
      description: "",
      category: "To Do",
      tag: "",
      color: "#DA3A3A",
    },
  ]);
  const [updatedTask, setUpdatedTask] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: "",
    tag: "",
    color: "",
  });
  const [columns, setColumns] = useState([
    "Backlog",
    "To Do",
    "In Progress",
    "Designed",
  ]);
  const [updatedColumn, setUpdatedColumn] = useState("");
  const [displayAddInput, setDisplayAddInput] = useState(false);
  const [newList, setNewList] = useState("");

  const handleAddList = (newColumn) => {
    if (newColumn.trim() === "") return;
    setColumns([...columns, newColumn]);
    setDisplayAddInput(false);
  };

  const editListName = (updatedColumn, index) => {
    if (updatedColumn.trim() === "") return;
    const category = columns[index];
    console.log(category);
    setTasks(
      tasks.map((t) =>
        t.category === category ? { ...t, category: updatedColumn } : t
      )
    );
    setColumns(
      columns.map((col, index) =>
        col === category ? (columns[index] = updatedColumn) : col
      )
    );
  };

  const tags = [
    ...new Set(
      tasks.map((item) => item.tag?.trim().toLowerCase()).filter((tag) => tag)
    ),
  ];

  const handleAddTask = (task) => {
    const id = Date.now() + Math.floor(Math.random() * 100);
    setTasks([...tasks, { id, ...task }]);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleEditTask = (updatedTask) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setUpdatedTask(null);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (!filters.searchTerm ||
        task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        task.description
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase())) &&
      (!filters.tag || task.tag.toLowerCase() === filters.tag.toLowerCase()) &&
      (!filters.color || task.color === filters.color)
  );

  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const activeTask = tasks.find((task) => task.id === activeId);
  const handleDragStart = (e) => setActiveId(e.active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    const overTask = tasks.find((task) => task.id === over.id);

    if (columns.includes(over.id)) {
      if (activeTask.category !== over.id) {
        setTasks(
          tasks.map((task) =>
            task.id === active.id ? { ...task, category: over.id } : task
          )
        );
      }
      return;
    }

    if (overTask && activeTask.category !== overTask.category) {
      setTasks(
        tasks.map((task) =>
          task.id === active.id
            ? { ...task, category: overTask.category }
            : task
        )
      );
      return;
    }

    if (overTask && activeTask.category === overTask.category) {
      const category = activeTask.category;
      const sameColumnTasks = tasks.filter(
        (task) => task.category === category
      );
      const others = tasks.filter((task) => task.category !== category);

      const oldIndex = sameColumnTasks.findIndex(
        (task) => task.id === active.id
      );
      const newIndex = sameColumnTasks.findIndex((task) => task.id === over.id);

      const reordered = arrayMove(sameColumnTasks, oldIndex, newIndex);
      setTasks([...others, ...reordered]);
    }
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen w-screen p-4 flex flex-col space-y-4 items-center overflow-x-auto">
        <div className="w-full px-4 fixed">
          <FilterBar tags={tags} setFilters={setFilters} filters={filters} />
        </div>

        <div className="w-full flex gap-3 mt-24">
          {columns?.map((heading, index) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.category === heading
            );
            return (
              <Column
                updatedTask={updatedTask}
                setUpdatedTask={setUpdatedTask}
                editTask={handleEditTask}
                addTask={handleAddTask}
                deleteTask={handleDeleteTask}
                key={index}
                heading={heading}
                tasks={columnTasks}
                setTasks={setTasks}
                updatedColumn={updatedColumn}
                setUpdatedColumn={setUpdatedColumn}
                editListName={() => editListName(updatedColumn, index)}
              />
            );
          })}

          <div className="bg-[#414141] p-4 flex items-center justify-between gap-4 h-fit rounded-lg min-w-[290px]">
            {displayAddInput ? (
              <>
                <Input
                  placeholder="Enter New List"
                  value={newList}
                  className="bg-[#323232]  placeholder:text-[#878787]"
                  onChange={(e) => setNewList(e.target.value)}
                />
                <button
                  onClick={() => handleAddList(newList)}
                  className="bg-[#878787] p-2 cursor-pointer rounded-lg flex justify-center items-center "
                >
                  submit
                </button>
              </>
            ) : (
              <>
                <h1>Create New List</h1>
                <button
                  onClick={() => {
                    setDisplayAddInput(!displayAddInput);
                  }}
                  className="bg-[#878787] h-5 w-5 cursor-pointer rounded-full flex justify-center items-center "
                >
                  <PlusIcon />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeTask && (
          <Card
            taskDetails={activeTask}
            isDragOverlay
            deleteTask={() => {}}
            editTask={() => {}}
            setDisplayForm={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
