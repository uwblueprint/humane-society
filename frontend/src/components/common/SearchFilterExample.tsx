import React, { useState } from "react";
import Filter from "./Filter";
import Search from "./Search";

const SearchFilterExample = (): React.ReactElement => {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
    console.log("Selected filters:", selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    console.log("Search query:", value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Search and Filter Example</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Current Filter State</h3>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
        <h3>Current Search Query</h3>
        <pre>{search}</pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Filter Component</h3>
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <Filter
            type="petList"
            onChange={handleFilterChange}
            selected={filters}
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Search Component</h3>
        <Search
          placeholder="Search for a pet..."
          onChange={handleSearchChange}
          search={search}
        />
      </div>
    </div>
  );
};

export default SearchFilterExample;
