import React from "react";
import Promise from "bluebird";
import {
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from "@excalidraw/excalidraw-next/types/types";
import { FONT_FAMILY } from "@excalidraw/excalidraw-next";
import { Portal } from "react-portal";
import WebFont from "webfontloader";

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

export default function useInjectFontFamily(params: {
  xdRef: ExcalidrawImperativeAPI | null;
}) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  const self = React.useRef({ xdRef: null as typeof params.xdRef | null });
  self.current.xdRef = params.xdRef;
  const { ready } = params.xdRef || {};

  React.useEffect(() => {
    if (!ready) return;
    const xdRef = self.current.xdRef!;
    (async () => {
      await addFonts(["Oswald"]);
      await Promise.delay(3000);
      xdRef.updateScene({
        elements: xdRef.getSceneElements().map((element) => ({
          ...element,
          fontFamily: 4,
        })),
      });
    })();
  }, [ready]);

  const onChange: ExcalidrawProps["onChange"] = (element, state) => {
    const activeToolType = state.activeTool.type;
    if (activeToolType === "text") {
      let buttonContainer: HTMLDivElement | null = null;
      for (const input of Array.from(
        document.querySelectorAll('.excalidraw input[name="font-family"]')
      )) {
        const btnList = input.closest("div.buttonList");
        if (btnList && btnList !== buttonContainer)
          buttonContainer = btnList as HTMLDivElement;
      }

      if (buttonContainer !== null) {
        buttonContainer.innerHTML = "";
        setContainer((s) => (s === buttonContainer ? s : buttonContainer));
      }
    } else {
      setContainer((s) => (s ? null : s));
    }
  };

  return {
    h: 1,
    render() {
      return <div>{<PortalContainer container={container} />}</div>;
    },
    onChange,
  };
}

function PortalContainer(props: { container: HTMLDivElement | null }) {
  return <Portal node={props.container}></Portal>;
}
