import { serve } from "bun";
import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join, extname, normalize } from "path";

const DIST = join(import.meta.dir, "../../vue3/dist");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".wasm": "application/wasm",
};

const indexHtml = readFileSync(join(DIST, "index.html"), "utf-8");

const EMBEDDED_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>无人碾压数字孪生系统</title>
</head>
<body style="margin:0;padding:0;overflow:hidden">
<iframe src="/api/vue3" style="width:100vw;height:100vh;border:none;position:fixed;top:0;left:0" title="Vue3 App"></iframe>
</body>
</html>`;

serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Root page - iframe embedding
    if (path === "/") {
      return new Response(EMBEDDED_HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Vue3 app entry
    if (path === "/api/vue3") {
      return new Response(indexHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Vue3 static assets
    if (path.startsWith("/api/vue3/")) {
      const relativePath = path.slice("/api/vue3/".length);

      // Path traversal protection
      if (relativePath.includes("..") || relativePath.startsWith("/")) {
        return new Response("Forbidden", { status: 403 });
      }

      const filePath = join(DIST, relativePath);

      try {
        const stat = statSync(filePath);
        if (stat.isFile()) {
          const content = readFileSync(filePath);
          const ext = extname(filePath).toLowerCase();
          const contentType = MIME[ext] || "application/octet-stream";
          const isHashed = /[.-][a-f0-9]{8}\./.test(relativePath);
          const headers: Record<string, string> = { "Content-Type": contentType };
          if (isHashed) {
            headers["Cache-Control"] = "public, max-age=31536000, immutable";
          }
          return new Response(content, { headers });
        }
      } catch {}

      // SPA fallback
      return new Response(indexHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("✅ Vue3 server running on http://localhost:3000");
