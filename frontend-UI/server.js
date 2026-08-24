import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "dist");
const port = process.env.PORT || 5173;

/*
 * Backend origin for /api and /uploads forwarding.
 *
 * The frontend always calls its OWN origin (relative /api/... URLs) so it
 * works from any device — this server relays those requests to the Spring
 * Boot backend, which by default runs on the same machine.
 */
const backendOrigin = process.env.BACKEND_ORIGIN || "http://localhost:8080";
const backendUrl = new URL(backendOrigin);

function proxyToBackend(req, res) {
  const options = {
    protocol: backendUrl.protocol,
    hostname: backendUrl.hostname,
    port: backendUrl.port || (backendUrl.protocol === "https:" ? 443 : 80),
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: `${backendUrl.hostname}:${backendUrl.port || 80}` },
  };

  const upstream = (backendUrl.protocol === "https:" ? https : http)
    .request(options, (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
      upstreamRes.pipe(res, { end: true });
    });

  upstream.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: 502,
      message: `Backend unavailable at ${backendOrigin}: ${err.message}`,
      code: "BAD_GATEWAY",
    }));
  });

  req.pipe(upstream, { end: true });
}

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

/*
 * HTTPS when dev certs are present.
 *
 * getUserMedia (face scanning) and geolocation (the attendance radius
 * check) only exist in SECURE contexts. Students opening the app from
 * phones/tablets/other laptops via this machine's LAN IP over plain
 * http:// get NO camera APIs at all — serving HTTPS fixes that on every
 * device (the self-signed cert triggers a one-time browser warning).
 */
const keyPath = path.join(__dirname, "certs", "key.pem");
const certPath = path.join(__dirname, "certs", "cert.pem");
const useHttps =
  process.env.HTTPS !== "false" &&
  fs.existsSync(keyPath) &&
  fs.existsSync(certPath);

function requestHandler(req, res) {
  // Relay backend traffic to Spring Boot — keeps every client request
  // same-origin regardless of which device the app is opened from.
  if (req.url === "/api" || req.url.startsWith("/api/") ||
      req.url === "/uploads" || req.url.startsWith("/uploads/")) {
    proxyToBackend(req, res);
    return;
  }

  let requestPath = decodeURIComponent(req.url.split("?")[0]);

  if (requestPath === "/") {
    requestPath = "/index.html";
  }

  let filePath = path.join(distPath, requestPath);

  // React Router fallback
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distPath, "index.html");
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Internal Server Error");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType,
    });

    res.end(data);
  });
}

const server = useHttps
  ? https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, requestHandler)
  : http.createServer(requestHandler);

server.listen(port, "0.0.0.0", () => {
  const scheme = useHttps ? "https" : "http";
  console.log(`Frontend running on ${scheme}://localhost:${port}`);
  console.log(`Proxying /api and /uploads -> ${backendOrigin}`);
  if (!useHttps) {
    console.log(
      "WARNING: running without HTTPS — camera (face scan) and geolocation " +
        "will be UNAVAILABLE on devices connecting over the network. " +
        "Add certs/key.pem + certs/cert.pem or set HTTPS=false to skip this check."
    );
  }
});
