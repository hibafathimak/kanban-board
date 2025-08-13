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
import Column from "../../components/Column";
import FilterBar from "../../components/FilterBar";
import Card from "../../components/Card";
import { PlusIcon } from "lucide-react";
import Input from "../../components/Input";
import { useRouter } from "next/navigation";
import { makePrivateAPIcall } from "../../utils/axiosInstance";
import task from "../../api/task";
import category from "@/app/api/category";
import { POST, PUT } from "@/app/constants";
import useFetchData from "../../hooks/makeGetAPICall";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [displayAddInput, setDisplayAddInput] = useState(false);
  const [newList, setNewList] = useState("");
  const router = useRouter();
  const [fetchData, setFetchData] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: "",
    tag: "",
    color: "",
  });
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     router.replace("/pages/login");
  //   }
  // }, []);
  const tasksData = useFetchData(task.list, fetchData);
  const categoriesData = useFetchData(category.list, fetchData);

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

  const handleAddList = async (newColumn) => {
    if (newColumn.trim() === "") return;
    await makePrivateAPIcall(
      POST,
      category.add,
      {
        category: newColumn,
      },
      (res) => {
        setFetchData(res);
      }
    );
    // fetchCategories();
    // setColumns([...columns, newColumn]);
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

  const handleDragEnd = async ({ active, over }) => {
    // debugger
    setActiveId(null);
    const activeTask = tasks?.find((task) => task.id === active.id);
    if (!over || !activeTask) return;

    const overTask = tasks?.find((task) => task.id === over.id);
    const overColumn = columns.find((col) => col.id === over.id);
    const category = overTask?.category || overColumn?.id
    const sameColumnTasks = tasks?.filter((task) => task.category === category);
    const columnIds = columns.map((col) => col.id);

    const updateData = async (updateValues) => {
      await makePrivateAPIcall(
        PUT,
        `${task.update}/${activeTask.id}`,
        {
          ...activeTask,
          ...updateValues,
        },
        (res) => {
          setFetchData(res);
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === active.id
            ? {
                ...task,
                ...updateValues,
              }
            : task
        )
      );
    };
    // Dropping on column or on a task in different column
    if (columnIds.includes(category) && activeTask.category !== category) {
      const overTaskIndex = sameColumnTasks.findIndex(
        (task) => task.id === overTask?.id
      );
      // console.log(overTaskIndex);
      const newSortOrder = overTaskIndex + 1;
      //update overtask sortOrder
      updateData(
        overTask
          ? { category: overTask.category, newSortOrder: newSortOrder }
          : { category: over.id, sortOrder: sameColumnTasks.length + 1 }
      );
      return;
    }
    //reordering in same column
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
        await makePrivateAPIcall(
          PUT,
          task.updateSortOrder,
          {
            taskId: activeTask.id,
            newIndex,
            category,
          },
          (res) => {
            setFetchData(res);
          }
        );
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
        <div className="w-full flex gap-3 mt-[200px] sm:mt-36 md:mt-24">
          {columns?.map((heading, index) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.category === heading.id
            );
            return (
              <Column
                key={heading.id}
                heading={heading}
                tasks={columnTasks}
                setFetchData={setFetchData}
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
