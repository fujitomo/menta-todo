// hooks/useSignUpForm.js
import { useEffect, useState } from "react";

export const useFileUpload = (onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void, value?: string, tmpFile?: File | undefined) => {
  const [fileName, setFileName] = useState("");
  const [fileDisplay, setFileDisplay] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    if (value) {
      setFileName(value);  // 外部から渡された値を使用
    }
  }, [value]);

  useEffect(() => {
    if (tmpFile) {
      setFileDisplay(tmpFile);  // 外部から渡された値を使用
    }
  }, [tmpFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        if (onChange) { 
          onChange(event);
        }
        setFileName(selectedFile.name);
        setFileDisplay(selectedFile);
      }
    } else {
      setFileDisplay(null);
    }
  };

  const displayImage = () => {
    console.log(fileDisplay)
    if (fileDisplay) {
      const reader = new FileReader();
      reader.onloadend = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(fileDisplay);
      setOpen(true);
    }
  };

  const deleteFile = () => {
    // ファイル名と画像ソースの状態をクリア
    setFileName("");
    setFileDisplay(null);
    setImageSrc("");
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    // ファイルインプットの値をリセット
    if (fileInput) fileInput.value = '';

    // onChangeハンドラがあれば、それも呼び出して状態を更新
    if (onChange) {
      const event = {
        target: {
          value: null
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
};


  const handleClose = () => setOpen(false);

  return {
    handleFileChange,
    displayImage,
    handleClose,
    fileName,
    imageSrc,
    open,
    deleteFile
  };
};
