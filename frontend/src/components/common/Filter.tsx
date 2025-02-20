import "./filter.css";
import React, { useState } from "react";
import {
  Button,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import FilterOpenIcon from "../assets/filter-open.svg";

import { filterConfigs } from "../../constants/filterConfig";

export type FilterType = "petList" | "userManagement";

type FilterProps = {
  type: FilterType;
  onFilterChange: (selectedFilters: Record<string, string[]>) => void;
  selected?: Record<string, string[]>;
};

const Filter: React.FC<FilterProps> = ({ type, onFilterChange, selected }) => {
  const filters = filterConfigs[type];
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >(selected || {});

  const handleOptionChange = (filterName: string, optionValue: string) => {
    setSelectedFilters((prev) => {
      const current = prev[filterName] || [];
      let updated: string[];
      if (current.includes(optionValue)) {
        updated = current.filter((v) => v !== optionValue);
      } else {
        updated = [...current, optionValue];
      }
      const newFilters = { ...prev, [filterName]: updated };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  return (
    <div>
      {filters.map((filter) => (
        <Popover key={filter.name}>
          <PopoverTrigger>
            <Button>
              <img src={FilterOpenIcon} alt="open" /> {filter.name}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody className="filter">
              <h4>Filter by: {filter.name}</h4>
              {filter.options.map((option) => (
                <div key={option.value}>
                  <input
                    type="checkbox"
                    onClick={() =>
                      handleOptionChange(filter.name, option.value)
                    }
                    checked={
                      selectedFilters[filter.name]?.includes(option.value) ||
                      false
                    }
                    readOnly
                  />
                  <p>{option.label}</p>
                </div>
              ))}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
};

export default Filter;
