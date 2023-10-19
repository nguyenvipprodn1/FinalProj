import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { useController, UseControllerProps } from "react-hook-form";

interface Props extends UseControllerProps {
    label: string;
    items: any[];
}

export default function AppSelectListKeyId(props: Props) {
    const {fieldState, field} = useController({...props, defaultValue: ''})
    return (
        <FormControl fullWidth error={!!fieldState.error}>
            <InputLabel>{props.label}</InputLabel>
            <Select
                value={field.value}
                label={props.label}
                onChange={field.onChange}
            >
                {props.items.map((item, index) => (
                    <MenuItem value={item.id} key={index}>{item.name}</MenuItem>
                ))}
            </Select>
            <FormHelperText>{fieldState.error?.message}</FormHelperText>
        </FormControl>
    )
}