import React from "react";
import { FiFilter } from "react-icons/fi";
import Button from "./Button";

const FilterButton = ({ children = "Filters", ...props }) => (
  <Button
    variant="secondary"
    size="sm"
    leftIcon={<FiFilter className="h-4 w-4" />}
    {...props}
  >
    {children}
  </Button>
);

export default FilterButton;
