import React from 'react';
import { Box, Button, Dialog, Input, TextField } from '@mui/material';
import { useFileUpload } from '@/hooks/other/useFileUpload';


type FileUploadProps = {
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    errorMessage?: string;
    isLoading?: boolean;
    label?: string;
    value?: string;
    tmpFile?: File | undefined;
};

export const FileUpload: React.FC<FileUploadProps> = ({
    onChange,
    error,
    errorMessage,
    label,
    value,
    tmpFile,
}) => {

    const {
        handleFileChange,
        displayImage,
        handleClose,
        fileName,
        imageSrc,
        open,
        deleteFile,
    } = useFileUpload(onChange, value, tmpFile);

    return (
        <Box className="flex items-center">
            <Box className="">
                <TextField
                    className={`w-[20rem]`}
                    color="success"
                    label={label || "添付画像"}
                    type="text"
                    value={fileName}
                    error={error}
                    helperText={<span className="text-base text-red-500">{errorMessage}</span>}
                    disabled={true}
                    InputLabelProps={{ shrink: !!fileName }}
                />
            </Box>
            <Box className="mx-2 flex flex-col items-start">
                <Button className="h-[3em] w-[15em] mb-2" component="label" variant="contained" color="success">
                    ファイル選択
                    <Input
                        type="file"
                        inputProps={{
                            "accept": "image/png, image/jpeg, image/gif, image/svg+xml"
                        }}
                        className="hidden"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            if (onChange) {
                                onChange(event);
                            }
                            handleFileChange(event);
                        }}
                    />
                </Button>
                <Box className="flex justify-between">
                    <Button
                        className={`h-[3em] w-[7.5em] text-white ${!fileName ? 'bg-gray-500' : 'bg-orange-500'}`}
                        variant="contained"
                        color="warning"
                        onClick={displayImage}
                        disabled={!fileName}
                    >
                        表示
                    </Button>
                    <Button
                        className={`h-[3em] w-[7.5em] text-white ${!fileName ? 'bg-gray-500' : 'bg-red-500'}`}
                        variant="contained"
                        color="error"
                        onClick={() => {
                            deleteFile();
                            handleClose();
                        }}
                        disabled={!fileName}
                    >
                        解除
                    </Button>
                </Box>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <img src={imageSrc} alt="Uploaded" className="max-w-full max-h-full" />
            </Dialog>
        </Box>
    );
};