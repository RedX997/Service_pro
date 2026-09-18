import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react()],
    build: {
      sourcemap: false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Explicitly define environment variables for production
      // process.env takes priority (Vercel / Cloudflare Pages injects vars this way)
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:3000/api'
      ),
      'import.meta.env.VITE_EMAILJS_SERVICE_ID': JSON.stringify(
        process.env.VITE_EMAILJS_SERVICE_ID || env.VITE_EMAILJS_SERVICE_ID || ''
      ),
      'import.meta.env.VITE_EMAILJS_TEMPLATE_ID': JSON.stringify(
        process.env.VITE_EMAILJS_TEMPLATE_ID || env.VITE_EMAILJS_TEMPLATE_ID || ''
      ),
      'import.meta.env.VITE_EMAILJS_PUBLIC_KEY': JSON.stringify(
        process.env.VITE_EMAILJS_PUBLIC_KEY || env.VITE_EMAILJS_PUBLIC_KEY || ''
      ),
    },
  };
});
