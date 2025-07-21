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
import { useState } from "react";
import Column from "./components/Column";
import FilterBar from "./components/FilterBar";
import Card from "./components/Card";

export default function Home() {
  const [updatedTask, setUpdatedTask] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: "",
    tag: "",
    color: "",
  });
  const columns = ["Backlog", "To Do", "In Progress", "Designed"];
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const activeTask = tasks.find(task => task.id === activeId);
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
      const sameColumnTasks = tasks.filter((task) => task.category === category);
      const others = tasks.filter((task) => task.category !== category);

      const oldIndex = sameColumnTasks.findIndex((task) => task.id === active.id);
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
      <div className="h-screen max-w-screen p-5 md:p-10 flex flex-col gap-4 align-items-center">
        <FilterBar tags={tags} setFilters={setFilters} filters={filters} />
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                key={heading}
                heading={heading}
                tasks={columnTasks}
                setTasks={setTasks}
              />
            );
          })}
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
      </div>
    </DndContext>
  );
}
