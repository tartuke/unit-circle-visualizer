// index.ts
import { serve } from "bun";
import { readFileSync } from "fs";
import { join } from "path";

// Function to serve static files with proper content types
function serveStaticFile(path: string, contentType: string) {
  try {
    const content = readFileSync(join(import.meta.dir, path));
    return new Response(content, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    return new Response("Not found", { status: 404 });
  }
}

// Start the server
serve({
  port: 3001,
  fetch(req) {
    const url = new URL(req.url);

    // Serve different file types based on path
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return serveStaticFile("public/index.html", "text/html");
    } else if (url.pathname === "/styles.css") {
      return serveStaticFile("public/styles.css", "text/css");
    } else if (url.pathname === "/unitCircle.js") {
      return serveStaticFile("public/unitCircle.js", "text/javascript");
    } else {
      return new Response("Not found", { status: 404 });
    }
  },
});

console.log("Server running at http://localhost:3001");
