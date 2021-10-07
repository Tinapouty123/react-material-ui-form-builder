import React, { forwardRef, Fragment, useMemo } from "react";
import { Chip, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Autocomplete } from "@material-ui/lab";
import get from "lodash/get";
import isObject from "lodash/isObject";
import PropTypes from "prop-types";
import { useValidation } from "../../Hooks/useValidation";
import { Title } from "../Widgets/Title";
import { getValidationType, shuffleArray } from "../Utils/helpers";

const useStyles = makeStyles(() => ({
  textFieldRoot: {
    marginTop: 0,
  },
}));

const StandardAutocompleteNoDrag = forwardRef((props, ref) => {
  const classes = useStyles();
  const { field, form, updateForm, showTitle } = props;
  const { errors, validate } = useValidation(getValidationType(field), field);

  const optionConfig = useMemo(
    () => (option) => {
      const config = {
        value: option,
        label: option,
      };

      if (!field.optionConfig) {
        return config;
      }

      if (field.optionConfig.value) {
        // This is to account for the quirky behaviour of onChange returning an array
        if (field.props && field.props.multiple && Array.isArray(option)) {
          const value = [];
          for (const item of option) {
            if (isObject(item)) {
              value.push(get(item, field.optionConfig.value));
            } else {
              value.push(item);
            }
          }
          config.value = value;
        } else {
          config.value = get(option, field.optionConfig.value);
        }
      }

      if (field.optionConfig.label) {
        // This is to account for the quirky behaviour of onChange returning an array
        if (field.props && field.props.multiple && Array.isArray(option)) {
          const label = [];
          for (const item of option) {
            if (isObject(item)) {
              label.push(item);
            } else {
              label.push(get(item, field.optionConfig.label));
            }
          }
          config.label = label;
        } else {
          config.label = get(option, field.optionConfig.label);
        }
      }

      return config;
    },
    [field]
  );

  /* 
  Required to handle quirky behaviour of Autocomplete component
  where it returns the option object when opening the selection box
  and returns the option value upon selection 
  */
  function getLabel(option) {
    if (isObject(option)) {
      return String(optionConfig(option).label);
    }
    if ((field.optionConfig || {}).value) {
      const o =
        field.options.find((o) => optionConfig(o).value === option) || {};
      return String(optionConfig(o).label);
    }
    return String(option);
  }

  const options = useMemo(() => {
    if (field.randomizeOptions) {
      return shuffleArray(field.options || []);
    }
    return field.options || [];
  }, [field.options]);

  const componentProps = (field) => {
    return {
      id: field.id || field.attribute,
      size: "small",
      fullWidth: true,
      options: options,
      getOptionSelected: (option, value) => {
        /* 
        Required to handle the quirky behaviour of Autocomplete component
        where it returns the value object sometimes and value value sometimes
        */
        return isObject(value)
          ? optionConfig(option).value === optionConfig(value).value
          : optionConfig(option).value === value;
      },
      getOptionLabel: (option) => getLabel(option),
      renderInput: (params) => (
        <TextField
          {...params}
          inputRef={(el) => {
            if (el && ref) {
              el.validate = (value) => validate(value);
              ref(el);
            }
          }}
          variant="outlined"
          margin="dense"
          inputProps={{
            ...params.inputProps,
            autoComplete: "off", // disable autocomplete and autofill
          }}
          label={field.label}
          error={errors?.length > 0}
          helperText={errors[0]}
          classes={{
            root: classes.textFieldRoot,
          }}
        />
      ),
      renderTags: (value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={index}
            variant="outlined"
            size="small"
            label={getLabel(option)}
            {...getTagProps({ index })}
          />
        )),
      value:
        get(form, field.attribute) ||
        (field.props && field.props.multiple ? [] : null),
      onChange: (event, option) => {
        updateForm({
          [field.attribute]: optionConfig(option).value,
        });
      },
      onBlur: () => validate(get(form, field.attribute)),
      className: classes.autocomplete,
      disablePortal: true,
      ...field.props,
    };
  };

  return (
    <Fragment>
      {showTitle && field.title && <Title field={field} form={form} />}
      <Autocomplete {...componentProps(field)} />
    </Fragment>
  );
});

StandardAutocompleteNoDrag.displayName = "StandardAutocompleteNoDrag";

StandardAutocompleteNoDrag.defaultProps = {
  updateForm: () => {},
  showTitle: true,
};

StandardAutocompleteNoDrag.propTypes = {
  field: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  updateForm: PropTypes.func,
  showTitle: PropTypes.bool,
};

export { StandardAutocompleteNoDrag };
