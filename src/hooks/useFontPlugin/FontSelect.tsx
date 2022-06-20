import React from "react";
import Select, { Props, SingleValue } from "react-select";
import { FONT_FAMILY } from "@excalidraw/excalidraw-next";

type TOption = { label: string; value: number };
type TFontSelectProps = Props<TOption, false>;

export default function FontSelect(props: {
  value?: SingleValue<TOption>;
  onChange: TFontSelectProps["onChange"];
}) {
  const options = React.useMemo(() => {
    return Object.entries(FONT_FAMILY).map((entry) => {
      const [name, index] = entry;
      return {
        label: name,
        value: index,
      };
    });
  }, []);

  return (
    <Select
      id="xd-font-selector"
      value={props.value}
      options={options}
      onChange={props.onChange}
      styles={{
        container: (s) => ({ ...s, width: "100%" }),
        input: (s) => ({ ...s, "> input": { boxShadow: "none !important" } }),
      }}
    />
  );
}
