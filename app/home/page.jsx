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
import { useEffect, useMemo, useState } from "react";
import Column from "../components/Column";
import FilterBar from "../components/FilterBar";
import Card from "../components/Card";
import { PlusIcon } from "lucide-react";
import Input from "../components/Input";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  makePrivateAPIcall,
  makePrivateGetAPIcall,
  makePublicAPIcall,
} from "../utils/axiosInstance";
import makeGetAPICall from "../hooks/makeGetAPICall";

export default function Home() {
  const [token, setToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [updatedTask, setUpdatedTask] = useState(null);
  const [displayAddInput, setDisplayAddInput] = useState(false);
  const [newList, setNewList] = useState("");
  const router = useRouter();
  const [filters, setFilters] = useState({
    searchTerm: "",
    tag: "",
    color: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(JSON.parse(localStorage.getItem("token")));
    if (token) {
      router.replace("/home");
    }
  }, []);
  const tasksData = makeGetAPICall("tasks/get-tasks");
  const categoriesData = makeGetAPICall("category/get-categories");
  useEffect(() => {
  if (tasksData?.task) {
    setTasks(tasksData.task);
  }
  if (categoriesData?.categories) {
    setColumns(categoriesData.categories);
  }
}, [tasksData?.task, categoriesData?.categories]);

  // const [tasks, setTasks] = useState(() => tasksData?.task || []);
  // const [columns, setColumns] = useState(
  //   () => categoriesData?.categories || []
  // );

  // useMemo(() => {
  //   if (tasksData?.task) setTasks(tasksData.task);
  //   if (categoriesData?.categories) setColumns(categoriesData.categories);
  // }, [tasksData?.task, categoriesData?.categories]);


  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const handleAddList = async (newColumn) => {
    if (newColumn.trim() === "") return;
    await makePrivateAPIcall(
      "POST",
      "category/create",
      {
        category: newColumn,
      },
      headers
    );
    fetchCategories();
    setColumns([...columns, newColumn]);
    setNewList("");
    setDisplayAddInput(false);
  };

  const tags = [
    ...new Set(
      tasks?.map((item) => item.tag?.trim().toLowerCase()).filter((tag) => tag)
    ),
  ];

  const filteredTasks = tasks?.filter(
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

  const activeTask = tasks?.find((task) => task.id === activeId);
  const handleDragStart = (e) => {
    setActiveId(e.active.id);
  };
  const handleDragEnd = async ({ active, over, ...test }) => {
    setActiveId(null);
    if (!over) return;

    console.log(test);
    console.log("over", over);

    let category = columns.filter((col) => col.id === over.id)?.[0]?.id;
    if (!category) {
      category = tasks?.filter((task) => task.id === over.id)?.[0]?.category;
    }

    const activeTask = tasks?.find((task) => task.id === active.id);
    if (!activeTask) return;

    const sameColumnTasks = tasks?.filter((task) => task.category === category);
    const overTask = sameColumnTasks.find((task) => task.id === over.id);

    console.log("activeTask", activeTask);
    console.log("overTask", overTask);

    const columnIds = columns.map((col) => col.id);

    // Dropping on column
    if (columnIds.includes(over.id)) {
      if (activeTask.category !== over.id) {
        try {
          const response = await makePrivateAPIcall(
            "PUT",
            `tasks/update-task/${activeTask.id}`,
            {
              ...activeTask,
              category: over.id,
              newSortOrder: sameColumnTasks.length + 1,
            },
            headers
          );

          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === active.id
                ? {
                    ...task,
                    category: over.id,
                    sortOrder: sameColumnTasks.length + 1,
                  }
                : task
            )
          );

          console.log(response);
        } catch (error) {
          console.error("Failed to update task category:", error);
        }
      }
      return;
    }

    // Dropping on a task in different column
    if (overTask && activeTask.category !== overTask.category) {
      const overTaskIndex = sameColumnTasks.findIndex(
        (task) => task.id === over.id
      );
      const newSortOrder = overTaskIndex + 1;

      try {
        const response = await makePrivateAPIcall(
          "PUT",
          `tasks/update-task/${activeTask.id}`,
          {
            ...activeTask,
            category: overTask.category,
            newSortOrder: newSortOrder,
          },
          headers
        );

        setTasks((prevTasks) =>
          prevTasks
            .map((task) =>
              task.id === active.id
                ? {
                    ...task,
                    category: overTask.category,
                    sortOrder: newSortOrder,
                  }
                : task
            )
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
      } catch (error) {
        console.error("Failed to update task category:", error);
      }
      return;
    }

    // Reordering within the same column
    if (overTask && activeTask.category === overTask.category) {
      const category = activeTask.category;
      const sameColumnTasks = tasks?.filter(
        (task) => task.category === category
      );
      const others = tasks?.filter((task) => task.category !== category);

      const oldIndex = sameColumnTasks.findIndex(
        (task) => task.id === active.id
      );
      const newIndex = sameColumnTasks.findIndex((task) => task.id === over.id);

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(sameColumnTasks, oldIndex, newIndex);
        setTasks([...others, ...reordered]);

        try {
          const response = await makePrivateAPIcall(
            "PUT",
            "tasks/update-sortOrder",
            { taskId: activeTask.id, newIndex, category },
            headers
          );
          console.log(response);
        } catch (error) {
          console.error("Failed to update sort order:", error);
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

        <div className="w-full flex flex-wrap gap-3 mt-[200px] sm:mt-36 md:mt-24">
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
              />
            );
          })}

          <div className="bg-[#414141] p-3 flex flex-row items-center justify-between gap-4 h-fit rounded-lg w-full sm:min-w-[290px] sm:max-w-[290px]">
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
