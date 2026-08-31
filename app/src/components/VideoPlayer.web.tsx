import React from "react";

export default function VideoPlayer({ embedUrl }: { embedUrl: string }) {
  return React.createElement("iframe", {
    src: embedUrl,
    style: { width: "100%", height: "100%", border: 0, backgroundColor: "black" },
    allow: "autoplay; encrypted-media; picture-in-picture",
    allowFullScreen: true,
  });
}
