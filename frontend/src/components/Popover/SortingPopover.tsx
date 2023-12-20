import React, { useState } from "react";
import { Popover, Typography, List, ListItem, ListItemText } from "@mui/material";
import { useSortingPopover } from "@/hooks/Popover/useSortingPopover";

interface SortingPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  open: boolean;
}

export const SortingPopover: React.FC<SortingPopoverProps> = ({ anchorEl, onClose, open }) => {
  const {
    handleItemClick,
  } = useSortingPopover();

  // 並び替え条件の項目を配列として定義します
  const sortingOptions = [
    { label: "終了日時（近日順)", value: "sortDate" },
    { label: "タイトル（あいうえお順）", value: "sortTitle" },
  ];

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
          <ListItem key={option.value} onClick={() => handleItemClick(option.value, onClose)}>
            <ListItemText primary={option.label} />
          </ListItem>
        ))}
      </List>
    </Popover>
  );
};