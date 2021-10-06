import React, {
  forwardRef,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { debounce } from "@material-ui/core/utils";
import PropTypes from "prop-types";
import get from "lodash/get";
import { useValidation } from "../../Hooks/useValidation";
import { Title } from "../Widgets/Title";
import { getValidationType } from "../Utils/helpers";

const useStyles = makeStyles(() => ({
  textFieldRoot: {
    marginTop: 0,
  },
}));

const getValidations = (field) => {
  var validations = {};
  const type = field.props && field.props.type;
  if (type === "email") {
    validations.email = true;
  }
  if (type === "url") {
    validations.url = true;
  }
  if (field.label) {
    validations.label = field.label;
  }
  validations = { ...validations, ...field.validations };
  return validations;
};

const getValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return value;
};

const debounceTimeout = 200;

const StandardTextField = forwardRef((props, ref) => {
  const classes = useStyles();
  const { field, form, updateForm, showTitle } = props;
  const { errors, validate } = useValidation(
    getValidationType(field),
    field,
    getValidations(field)
  );

  const inputRef = useRef();
  const [focus, setFocus] = useState();

  const debouncedUpdateForm = useMemo(
    () =>
      debounce((field, value) => {
        if (field.props && field.props.type === "number") {
          if (value === "" || value === null || value === undefined) {
            value = undefined;
          } else {
            value = Number(value);
          }
        }
        updateForm({ [field.attribute]: value });
      }, debounceTimeout),
    [updateForm]
  );

  useEffect(() => {
    if (inputRef.current && !focus) {
      inputRef.current.value = getValue(get(form, field.attribute));
    }
  }, [form, field.attribute, focus]);

  const componentProps = (field) => {
    return {
      id: field.id || field.attribute,
      classes: {
        root: classes.textFieldRoot,
      },
      fullWidth: true,
      variant: "outlined",
      margin: "dense",
      label: field.label,
      defaultValue: getValue(get(form, field.attribute)),
      onChange: (event) => {
        if (focus) {
          debouncedUpdateForm(field, event.target.value);
        }
      },
      InputLabelProps: {
        shrink:
          !!get(form, field.attribute) || get(form, field.attribute) === 0,
      },
      error: errors?.length > 0,
      helperText: errors[0],
      onFocus: () => setFocus(true),
      onBlur: () => {
        setFocus(false);
        validate(get(form, field.attribute));
      },
      onKeyDown: (event) => {
        if (event.which === 13) {
          validate(get(form, field.attribute));
        }
      },
      ...field.props,
    };
  };

  return (
    <Fragment>
      {showTitle && field.title && <Title field={field} form={form} />}
      <TextField
        inputRef={(el) => {
          if (el && ref) {
            el.validate = (value) => validate(value);
            ref(el);
          }
          inputRef.current = el;
        }}
        {...componentProps(field)}
      />
    </Fragment>
  );
});

StandardTextField.displayName = "StandardTextField";

StandardTextField.defaultProps = {
  updateForm: () => {},
  showTitle: true,
};

StandardTextField.propTypes = {
  field: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  updateForm: PropTypes.func,
  showTitle: PropTypes.bool,
};

export { StandardTextField };
