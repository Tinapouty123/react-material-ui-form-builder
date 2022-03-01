import { CommonFieldProps } from "../components/props/FieldProps";

export function shuffleArray(array: Array<any>) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getTitleProps(field: CommonFieldProps) {
  const {
    title,
    titleProps,
    titleContainerProps,
    titleSuffixComponent,
    titleSuffix,
    titleSuffixProps,
  } = field;

  return {
    title: title || "",
    titleProps,
    titleContainerProps,
    titleSuffixComponent,
    titleSuffix,
    titleSuffixProps,
  };
}
