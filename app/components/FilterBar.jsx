import { ChevronDown, ChevronUp, XIcon } from "lucide-react";
import { useState } from "react";
import Input from "./Input";
import ColorInput from "./ColorInput";

const FilterBar = ({ tags, filters, setFilters }) => {
  const [displayTags, setDisplayTags] = useState(false);
  const { searchTerm, tag, color } = filters;

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      tag: "",
      color: "",
    });
  };

  return (
    <div className=" w-full rounded-lg p-5 bg-[#262626] grid gap-4 sm:grid-cols-2 md:grid-cols-3 relative">
      <div className="flex gap-2">
        <Input
          className="bg-[#323232]  placeholder:text-[#878787] "
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) =>
            setFilters({ ...filters, searchTerm: e.target.value })
          }
        />
        {searchTerm && (
          <button
            className="cursor-pointer"
            onClick={() => setFilters({ ...filters, searchTerm: "" })}
          >
            <XIcon size={14} />
          </button>
        )}
      </div>
      <div className="relative w-full ">
        <div className="flex gap-2">
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
                      tagItem === tag
                        ? "bg-[#3a3a3a] text-white"
                        : "text-[#aaa]"
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
          {tag && (
            <button
              className="cursor-pointer"
              onClick={() => setFilters({ ...filters, tag: "" })}
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 items-center w-full ">
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
        {color && (
          <button
            className="cursor-pointer"
            onClick={() => setFilters({ ...filters, color: "" })}
          >
            <XIcon size={14} />
          </button>
        )}
 
      </div>
             { (searchTerm || tag || color) &&
          <button className="cursor-pointer text-xs right-4 absolute top-0 mt-1 " onClick={resetFilters}>
            Clear All
          </button>
        }
    </div>
  );
};

export default FilterBar;
