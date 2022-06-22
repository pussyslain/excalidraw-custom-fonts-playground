import React from "react";
import Promise from "bluebird";
import { exportToBlob } from "@excalidraw/excalidraw-next";

import useInjectFontFamily from "./hooks/useFontPlugin";

const dataId = "xxx-xxx";

export default function App() {
  const [blobUrl, setBlobUrl] = React.useState(null);

  useInjectFontFamily({ xdRef: null });

  React.useEffect(() => {
    (async () => {
      await Promise.delay(5000);
      const dataRes = await fetch(`${dataId}/data.json`);
      const initialData = await dataRes.json();
      exportToBlob({
        mimeType: "image/png",
        // elements: excalidrawAPI.getSceneElements(),
        elements: initialData.elements,
        appState: {
          width: 300,
          height: 100,
        },
        embedScene: true,
        // files: excalidrawAPI.getFiles(),
      }).then((blob) => {
        console.log(">>src/ExcalDraw::", "blob", blob); //TRACE
        const url = URL.createObjectURL(blob);
        console.log(">>src/ExcalDraw::", "url", url); //TRACE
        setBlobUrl(url);
      });
    })();
  }, []);

  return <div>{blobUrl && <a href={blobUrl}>DL</a>}</div>;
}
