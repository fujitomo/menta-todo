import React, { useState } from "react";
import { Button, Popover, Typography, List, ListItem, ListItemText } from "@mui/material";


interface SortingPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  open: boolean;
}

export const SortingPopover: React.FC<SortingPopoverProps> = ({ anchorEl, onClose, open }) => {
  // 並び替え条件の項目を配列として定義します
  const sortingOptions = [
    { label: "終了日時（近日順)", value: "latest" },
    { label: "カード名（あいうえお順）", value: "cardSort" },
  ];

  function handleItemClick(value: string) {
    console.log("Clicked item with value:", value);
    // Add more logic here based on the clicked item
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Typography variant="h6" className="text-gray-300 ml-4">並び替え</Typography>
      <List>
        {sortingOptions.map((option) => (
          <ListItem button key={option.value} onClick={() => handleItemClick(option.value)}>
            <ListItemText primary={option.label} />
          </ListItem>
        ))}
      </List>
    </Popover>
  );
};