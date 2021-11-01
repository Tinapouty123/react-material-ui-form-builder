import React, { forwardRef, Fragment, useCallback } from "react";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { useValidation } from "../../Hooks/useValidation";
import { Title } from "../Widgets/Title";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Event } from "@mui/icons-material";
import {
  DesktopDateTimePicker,
  LocalizationProvider,
  MobileDateTimePicker,
} from "@mui/lab";

const StandardDateTimePicker = forwardRef((props, ref) => {
  const { field, value, updateForm, showTitle } = props;
  const { errors, validate } = useValidation("date", field.validations);

  const component = useCallback(
    (props) => {
      if (field.keyboard) {
        return <DesktopDateTimePicker {...props} />;
      }
      return <MobileDateTimePicker {...props} />;
    },
    [field.keyboard]
  );

  const componentProps = (field) => {
    return {
      id: field.id || field.attribute,
      sx: {
        my: 0,
      },
      ampm: false,
      fullWidth: true,
      inputVariant: "outlined",
      size: "small",
      format: "dd/MM/yyyy HH:mm:ss",
      label: field.label,
      value: value || null,
      onChange: (value) => {
        if (value) {
          try {
            const formatted = format(value, "yyyy-MM-dd HH:mm:ss");
            updateForm({ [field.attribute]: formatted });
          } catch (error) {
            console.log(error);
          }
        } else {
          updateForm({ [field.attribute]: undefined });
        }
      },
      renderInput: (params) => <TextField fullWidth size="small" {...params} />,
      InputProps: {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton aria-label="open date time picker" size="large">
              <Event />
            </IconButton>
          </InputAdornment>
        ),
        style: {
          paddingRight: 0,
        },
      },
      error: errors?.length > 0,
      helperText: errors[0],
      onBlur: () => validate(value),
      onKeyDown: (event) => {
        if (event.which === 13) {
          validate(value);
        }
      },
      ...field.props,
    };
  };

  return (
    <Fragment>
      {showTitle && field.title && <Title field={field} />}
      <div
        ref={(el) => {
          if (el && ref) {
            el.validate = (value) => validate(value);
            ref(el);
          }
        }}
      >
        <LocalizationProvider dateAdapter={DateAdapter}>
          {component(componentProps(field))}
        </LocalizationProvider>
      </div>
    </Fragment>
  );
});

StandardDateTimePicker.displayName = "StandardDateTimePicker";

StandardDateTimePicker.defaultProps = {
  updateForm: () => {},
  showTitle: true,
};

StandardDateTimePicker.propTypes = {
  field: PropTypes.object.isRequired,
  value: PropTypes.any,
  updateForm: PropTypes.func,
  showTitle: PropTypes.bool,
};

export { StandardDateTimePicker };
