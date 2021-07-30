import React, { useMemo } from "react";
import { Chip, makeStyles, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import _ from "lodash";
import { Fragment } from "react";

const useStyles = makeStyles((theme) => ({
  chip: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

function StandardChipGroup(props) {
  const classes = useStyles();
  const { field, form, updateForm } = props;

  const optionConfig = useMemo(
    () => (option) => {
      const config = {
        key: option,
        value: option,
        label: option,
      };

      if (!field.optionConfig) {
        return config;
      }

      config.key = field.optionConfig.key
        ? option[field.optionConfig.key]
        : config.key;
      config.value = field.optionConfig.value
        ? option[field.optionConfig.value]
        : config.value;
      config.label = field.optionConfig.label
        ? option[field.optionConfig.label]
        : config.label;

      return config;
    },
    [field]
  );

  const handleChipClick = (option) => {
    if (field.multiple) {
      const index = (_.get(form, field.attribute) || []).findIndex(
        (value) => value === optionConfig(option).value
      );
      if (index >= 0) {
        var copy = [..._.get(form, field.attribute)];
        copy.splice(index, 1);
        if (copy.length === 0) {
          copy = null;
        }
        updateForm(field.attribute, copy);
        return;
      }
      updateForm(field.attribute, [
        ...(_.get(form, field.attribute) || []),
        optionConfig(option).value,
      ]);
    } else {
      if (_.get(form, field.attribute) === optionConfig(option).value) {
        updateForm(field.attribute, undefined);
        return;
      }
      updateForm(field.attribute, optionConfig(option).value);
    }
  };

  const componentProps = (field, option) => {
    var isSelected;
    if (field.multiple) {
      isSelected =
        _.get(form, field.attribute) &&
        _.get(form, field.attribute).includes(optionConfig(option).value);
    } else {
      isSelected = _.get(form, field.attribute) === optionConfig(option).value;
    }
    return {
      className: classes.chip,
      key: optionConfig(option).key,
      size: "small",
      label: optionConfig(option).label,
      color: isSelected ? "primary" : "default",
      variant: isSelected ? "default" : "outlined",
      onClick: () => handleChipClick(option),
      ...(field.props || {}),
    };
  };

  return (
    <Fragment>
      {field.label && (
        <Typography {...field.labelProps}>{field.label}</Typography>
      )}
      <div {...field.chipContainerProps}>
        {field.options.map((option) => (
          <Chip {...componentProps(field, option)} />
        ))}
      </div>
    </Fragment>
  );
}

StandardChipGroup.defaultProps = {
  updateForm: () => {},
};

StandardChipGroup.propTypes = {
  field: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  updateForm: PropTypes.func,
};

export default StandardChipGroup;
