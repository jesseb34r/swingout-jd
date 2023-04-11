import solid from "solid-start/vite";
import { defineConfig } from "vite";
import vercel from "solid-start-vercel";
import prpc from "@prpc/vite";import path from "path";
  
export default defineConfig(() => {
  return {
    plugins: [prpc(), solid({ ssr: true, adapter: vercel({ edge: false }) })],
    ssr: { external: ["@prisma/client"] },
    resolve: {
      alias: {
        rpc: path.join(__dirname, "src", "server", "api"),
      },
    },
  };
});
  