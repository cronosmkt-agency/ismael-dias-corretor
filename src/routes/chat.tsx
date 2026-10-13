import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  beforeLoad: () => {
    throw redirect({ to: "/loja" });
  },
  head: () => ({
    meta: [
      { title: "Atendimento — Ismael Dias | Habittat House" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: () => null,
});

export default Route;
