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

import { filterConfigs, FilterSection } from "../../constants/filterConfig";

export type FilterType = "petList" | "userManagement";

type FilterProviderProps = {
  type: FilterType;
  onFilterChange: (selectedFilters: Record<string, string[]>) => void;
  selected?: Record<string, string[]>;
};

type FilterProps = {
  onChange: (value: string) => void;
  data: FilterSection;
  selectedOptions?: string[];
};

const Filter: React.FC<FilterProps> = ({
  onChange,
  data,
  selectedOptions = [],
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button>
          <img src={FilterOpenIcon} alt="open" />
          {data.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody className="filter">
          <h4>Filter by: {data.name}</h4>
          {data.options.map((option) => (
            <div key={option.value}>
              <input
                type="checkbox"
                onClick={() => onChange(option.value)}
                checked={selectedOptions.includes(option.value)}
                readOnly
              />
              <p>{option.label}</p>
            </div>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const FilterProvider: React.FC<FilterProviderProps> = ({
  type,
  onFilterChange,
  selected,
}) => {
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
        <Filter
          key={filter.name}
          data={filter}
          selectedOptions={selectedFilters[filter.name] || []}
          onChange={(value) => handleOptionChange(filter.name, value)}
        />
      ))}
    </div>
  );
};

export default FilterProvider;
