import React, { FC } from "react";
import Input from "./Input";

interface PaginationProps {
  value: number; // current page (1-based index)
  onChange: (page: number) => void; // callback when page changes
  numberOfItems: number; // total number of items
  itemsPerPage: number; // number of items per page
  className?: string; // optional styling
}

const Pagination: FC <PaginationProps> = ({ 
    value, 
    onChange, 
    numberOfItems, 
    itemsPerPage, 
    className = ""
}) => {
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = (event.target.value)
        if (value < 1) {
            value = 1;
        } 
        else if (value > Math.ceil(numberOfItems / itemsPerPage)) {
            value = Math.ceil(numberOfItems / itemsPerPage);
        }
        onChange(value);
    };
  return <div>Pagination
    <Input
        onChange={handleInputChange}
    />
  </div>;
}

export default Pagination;
