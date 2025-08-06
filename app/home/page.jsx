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
import axios from "axios";

export default function Home() {
  const [token, setToken] = useState(null);

  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(JSON.parse(localStorage.getItem("token")));
    if (token) {
      router.replace("/home");
    }
  }, []);

  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchTasks = async () => {
    const test = JSON.parse(localStorage.getItem("token"));
    const response = await axios.get(
      "http://localhost:5000/api/tasks/get-tasks",
      {
        headers: {
          Authorization: `Bearer ${test}`,
          "Content-Type": "application/json",
        },
      }
    );
    setTasks(response.data.task);
  };

  const fetchCategories = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    const response = await axios.get(
      "http://localhost:5000/api/category/get-categories",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    setColumns(response.data.categories);
  };

  const [updatedTask, setUpdatedTask] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: "",
    tag: "",
    color: "",
  });
  const [displayAddInput, setDisplayAddInput] = useState(false);
  const [newList, setNewList] = useState("");

  const handleAddList = async (newColumn) => {
    if (newColumn.trim() === "") return;
    const response = await axios.post(
      "http://localhost:5000/api/category/create",
      {
        category: newColumn,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    fetchCategories();
    setColumns([...columns, newColumn]);
    setNewList("");
    setDisplayAddInput(false);
  };

  const tags = [
    ...new Set(
      tasks.map((item) => item.tag?.trim().toLowerCase()).filter((tag) => tag)
    ),
  ];

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
  const handleDragStart = (e) => {
    setActiveId(e.active.id);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    const overTask = tasks.find((task) => task.id === over.id);

    if (!activeTask) return;

    const columnIds = columns.map((col) => col.id);

    // Dropping on column
    if (columnIds.includes(over.id)) {
      if (activeTask.category !== over.id) {
        try {
          const response = await axios.put(
            `http://localhost:5000/api/tasks/update-task/${activeTask.id}`,
            { ...activeTask, category: over.id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === active.id ? { ...task, category: over.id } : task
            )
          );
        } catch (error) {
          console.error("Failed to update task category:", error);
        }
      }
      return;
    }

    // Dropping on a task in different column
    if (overTask && activeTask.category !== overTask.category) {
      try {
        const response = await axios.put(
          `http://localhost:5000/api/tasks/update-task/${activeTask.id}`,
          { ...activeTask, category: overTask.category },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === active.id
              ? { ...task, category: overTask.category }
              : task
          )
        );
      } catch (error) {
        console.error("Failed to update task category:", error);
      }
      return;
    }

    // Reordering
    console.log(overTask.sortOrder);
    console.log(activeTask.sortOrder);
    if (overTask && activeTask.category === overTask.category) {
      const category = activeTask.category;
      const sameColumnTasks = tasks.filter(
        (task) => task.category === category
      );
      const others = tasks.filter((task) => task.category !== category);

      const oldIndex = sameColumnTasks.findIndex(
        (task) => task.id === active.id
      );
      console.log("oldIndex", oldIndex);
      const newIndex = sameColumnTasks.findIndex((task) => task.id === over.id);
      console.log("newIndex", newIndex);
      if (oldIndex !== newIndex) {
        const reordered = arrayMove(sameColumnTasks, oldIndex, newIndex);
        setTasks([...others, ...reordered]);

        try {
          const response = await axios.put(
            'http://localhost:5000/api/tasks/update-sortOrder',
            { taskId: activeTask.id, newIndex },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(response);
        } catch (error) {
          console.error(error);
        }
      }
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
              (task) => task.category === heading.id
            );
            return (
              <Column
                updatedTask={updatedTask}
                setUpdatedTask={setUpdatedTask}
                key={heading.id}
                heading={heading}
                tasks={columnTasks}
                setTasks={setTasks}
                fetchTasks={fetchTasks}
                fetchCategories={fetchCategories}
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
