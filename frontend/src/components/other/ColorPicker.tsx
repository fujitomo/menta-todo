import React from 'react';
import { SketchPicker } from 'react-color';
import { Box, Popover, Typography } from '@mui/material';
import { useColorPicker } from '@/hooks/other/useColorPicker';

interface ColorPickerProps {
    onChange?: (color: string) => void;
    disabled?: boolean;
    value?: string; // value プロップスを追加
}

export default function ColorPickerComponent({
    onChange,
    disabled,
    value // value プロップスを受け取る
}: ColorPickerProps): JSX.Element {
    const {
        color,
        handleClick,
        handleClose,
        handleChangeComplete,
        anchorEl
    } = useColorPicker(value);

    const open = Boolean(anchorEl);
    const id = open ? 'color-picker-popover' : undefined;

    return (
        <Box>
            <Typography>カラー</Typography>
            <Box
                aria-describedby={id}
                onClick={disabled ? undefined : handleClick}
                className={`w-10 h-10 cursor-pointer border-2 border-black`}
                style={{ backgroundColor: color }}
            >
                {/* Box content goes here */}
            </Box>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
            >
                <SketchPicker
                    color={color}
                    onChangeComplete={(colorResult) => {
                        handleChangeComplete(colorResult);
                        if (onChange) {
                            onChange(colorResult.hex);
                        }
                    }}
                />
            </Popover>
        </Box>
    );
}