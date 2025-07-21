import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Input from "./Input";
import ColorInput from "./ColorInput";

const FilterBar = ({ tags, filters, setFilters }) => {
  const [displayTags, setDisplayTags] = useState(false);
  const { searchTerm, tag, color } = filters;

  return (
    <div className="w-full rounded-2xl p-4 bg-[#262626] grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <Input
        className="bg-[#323232]  placeholder:text-[#878787] "
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
      />

      <div className="relative w-full">
        <button
          onClick={() => setDisplayTags(!displayTags)}
          className="w-full bg-[#323232] rounded-lg py-2 px-4 text-[#878787] flex justify-between items-center capitalize transition-colors hover:bg-[#3a3a3a]"
        >
          <span className={` ${tag ? "text-white" : "text-[#878787]"}`}>
            {tag || "Tag"}
          </span>
          {displayTags ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {displayTags && (
          <ul className="absolute top-full mt-2 left-0 w-full bg-[#2b2b2b] rounded-lg shadow-lg border border-[#444] z-50 max-h-48 overflow-y-auto">
            {tags?.length > 0 ? (
              tags.map((tagItem, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setFilters({ ...filters, tag: tagItem });
                    setDisplayTags(false);
                  }}
                  className={`p-2 px-4 cursor-pointer capitalize hover:bg-[#444] hover:text-white transition-colors ${
                    tagItem === tag ? "bg-[#3a3a3a] text-white" : "text-[#aaa]"
                  }`}
                >
                  {tagItem}
                </li>
              ))
            ) : (
              <li className="p-2 px-4 text-sm text-gray-400">
                No tags available
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="flex gap-3 items-center w-full">
        <Input
          className="bg-[#323232]  placeholder:text-[#878787] flex-1 "
          type="text"
          onChange={(e) => setFilters({ ...filters, color: e.target.value })}
          value={color || "#ffffff"}
        />
        <ColorInput
          value={color || "#ffffff"}
          onChange={(e) => setFilters({ ...filters, color: e.target.value })}
        />
      </div>
    </div>
  );
};

export default FilterBar;
