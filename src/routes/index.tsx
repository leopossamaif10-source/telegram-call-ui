import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Chamada · Telegram" },
      { name: "description", content: "Simulação ultra realista de chamada de vídeo estilo Telegram." },
    ],
  }),
});

function Index() {
  return (
    <iframe
      src="/call.html"
      title="Chamada de vídeo"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        background: "#000",
      }}
      allow="autoplay; microphone; camera; fullscreen"
    />
  );
}
