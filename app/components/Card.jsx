import { useState } from "react";
import { PenIcon, TrashIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Card = ({
  taskDetails,
  deleteTask,
  setDisplayForm,
  editTask,
  isDragOverlay = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const textColor = taskDetails?.color === "#ffffff" || taskDetails?.color === "#FFFFFF"
    ? "text-gray-800"
    : "text-white";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: taskDetails.id,
    disabled: isDragOverlay
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: taskDetails.color }}
      {...attributes}
      {...listeners}
      className={`rounded-lg p-4 mt-2 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex text-[14px] font-semibold justify-between items-center">
        <h4 className={`text-sm ${textColor} capitalize`}>
          {taskDetails?.title}
        </h4>

        {isHovered && !isDragOverlay && (
          <div className={`flex gap-2 items-center ${textColor}`}>
            <TrashIcon
              className="cursor-pointer"
              onClick={() => deleteTask(taskDetails.id)}
              size={12}
            />
            <PenIcon
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                editTask();
                setDisplayForm(true);
              }}
              size={12}
            />
          </div>
        )}
      </div>

      {taskDetails?.description && (
        <p className={`text-sm font-extralight mt-2 ${textColor}`}>
          {taskDetails?.description}
        </p>
      )}

      {taskDetails?.tag && (
        <p
          className={`border text-xs font-light capitalize rounded-sm w-fit p-1 mt-2 ${textColor}`}
        >
          {taskDetails?.tag}
        </p>
      )}
    </div>
  );
};

export default Card;
