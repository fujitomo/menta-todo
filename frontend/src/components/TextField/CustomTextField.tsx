import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";

//TODO エラーメッセージ用helperTextのclassNameを共通化したが上手くいかないので保留
function CustomTextField(props: any) {
  const { error, helperText, ...other } = props;

  return (
    <TextField
      {...other}
      color="success"
      error={other.error}
      helperText={
        <Box component="span" className="text-base text-red-500">
          {other.error.email?.message}
        </Box>
      }
    />
  );
}

export default CustomTextField;
