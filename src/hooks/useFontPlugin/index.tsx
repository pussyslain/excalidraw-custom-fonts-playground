import React from "react";
import Promise from "bluebird";
import {
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from "@excalidraw/excalidraw-next/types/types";
import { FONT_FAMILY } from "@excalidraw/excalidraw-next";
import { Portal } from "react-portal";
import WebFont from "webfontloader";
import FontSelect from "./FontSelect";

type TFontSelectProps = Parameters<typeof FontSelect>[0];

function addFonts(familyNames: string[]) {
  return new Promise<void>((resolve, reject) => {
    WebFont.load({
      google: {
        families: familyNames,
      },
      active() {
        const nextIndex = Object.keys(FONT_FAMILY).length + 1;
        const fontMap = familyNames.reduce((acc, current, index) => {
          acc[current] = nextIndex + index;
          return acc;
        }, {} as Record<string, number>);
        Object.assign(FONT_FAMILY, fontMap);
        console.log(">>src/useInjectFontFamily::", "active"); //TRACE
        resolve();
      },
    });
  });
}

export default function useFontPlugin(params: {
  xdRef: ExcalidrawImperativeAPI | null;
}) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const [selectedFontValue, setSelectedFontValue] =
    React.useState<TFontSelectProps["value"]>(null);

  const self = React.useRef({ xdRef: null as typeof params.xdRef | null });
  self.current.xdRef = params.xdRef;
  const { ready } = params.xdRef || {};

  React.useEffect(() => {
    if (!ready) return;
    // const xdRef = self.current.xdRef!;
    (async () => {
      await addFonts(["Oswald"]);
      // await Promise.delay(3000);
      // xdRef.updateScene({
      //   elements: xdRef.getSceneElements().map((element) => ({
      //     ...element,
      //     fontFamily: 4,
      //   })),
      // });
    })();
  }, [ready]);

  const onChange: ExcalidrawProps["onChange"] = (elements, state) => {
    const fontFamilyInputs = document.querySelectorAll(
      '.excalidraw input[name="font-family"]'
    );
    const isFontSelectorLoaded = !!document.querySelector("#xd-font-selector");
    const shouldReplaceFontFamily = fontFamilyInputs.length > 0;

    if (shouldReplaceFontFamily) {
      let fontFamilyContainer: HTMLDivElement | null = null;
      for (const input of Array.from(fontFamilyInputs)) {
        const btnList = input.closest("div.buttonList");
        if (btnList && btnList !== fontFamilyContainer)
          fontFamilyContainer = btnList as HTMLDivElement;
      }

      if (fontFamilyContainer !== null) {
        fontFamilyContainer.innerHTML = "";
        setContainer((s) =>
          s === fontFamilyContainer ? s : fontFamilyContainer
        );
      }
    } else {
      if (!isFontSelectorLoaded) setContainer((s) => (s ? null : s));
    }

    // select font value from current element
    for (const elem of elements) {
      if (!state.selectedElementIds[elem.id]) continue;
      if (elem.type === "text") {
        for (const [label, value] of Object.entries(FONT_FAMILY)) {
          if (value === elem.fontFamily)
            setSelectedFontValue((s) => {
              if (s && s.value === value) return s;
              return { value, label };
            });
        }
      }
    }
  };

  return {
    render() {
      return (
        <div>
          <FontSelectPortalContainer
            container={container}
            value={selectedFontValue}
            onChange={(item) => {
              if (!item?.value) return;

              const xdRef = self.current.xdRef!;
              const { selectedElementIds } = xdRef.getAppState();
              xdRef.updateScene({
                elements: xdRef.getSceneElements().map((element) => {
                  if (!selectedElementIds[element.id]) return element;
                  return {
                    ...element,
                    fontFamily: item?.value,
                  };
                }),
              });
            }}
          />
        </div>
      );
    },
    onChange,
  };
}

function FontSelectPortalContainer(
  props: {
    container: HTMLDivElement | null;
  } & TFontSelectProps
) {
  const { container, ...selectProps } = props;

  return (
    <Portal node={props.container}>
      <FontSelect {...selectProps} />
    </Portal>
  );
}
