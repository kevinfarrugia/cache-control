import { createHash } from "crypto";
import { createServer } from "http";

const md5 = (input) => createHash("md5").update(input).digest("hex");

// stylesheet for demo
const getStyle = () => `
  * { 
    font-family: sans-serif;
  }

  html {
    background-color: #fafafa;
  }

  pre {
    font-family: monospace;
  }

  nav {
    background-color: #fff;
  }

  nav > a {
    display: block;
    padding: 0.5em;
  }

  nav > a:hover {
    background-color: #cacaca;
  }

  .wrapper {
    height: 50vh;
    padding: 0.25em;
    overflow: auto;
    border: 1px solid #333;
  }

  .content {
    font-size: 12px;
    color: #333;
  }
`;

// returns the time from the date object as HH:mm:ss
const getTime = (date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

// returns the HTML for the demo
const getHtml = ({ title, text, version }) => `
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/style.v${version || 1}.css">
  </head>
  <body>
    <pre>${title || ""}</pre>
    <p>${text || ""}</p>
    <p>
      Generated on origin: <strong>${getTime(
        new Date()
      )}</strong> | Current time <strong id="time"></strong>
    </p>
    <nav>
      <a href="/no-store">no-store</a>
      <a href="/no-cache">private, no-cache</a>
      <a href="/public-no-cache">public, no-cache</a>
      <a href="/max-age-0">private, max-age=0</a>
      <a href="/public-max-age-0-must-revalidate">public, max-age=0, must-revalidate</a>
      <a href="/public-max-age-60">public, max-age=60</a>
      <a href="/public-max-age-60-must-revalidate">public, max-age=60, must-revalidate</a>
      <a href="/max-age-60-stale-while-revalidate-60">private, max-age=60, stale-while-revalidate=60</a>
      <a href="/public-max-age-10-stale-while-revalidate-10-stale-if-error-60">public, max-age=10, stale-while-revalidate=10, stale-if-error=60</a>
    </nav>
    <br />
    <div class="wrapper">
      ${[...Array(500)]
        .map(
          () =>
            "<p class='content'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloribus dicta id, tempora rem accusamus ab ex, ratione ad exercitationem libero laudantium fugit reiciendis corrupti quis ipsam dolorum maxime perspiciatis nemo?</p>"
        )
        .join("")}
    </div>    
    <div>
      <p>
        <a href="https://github.com/kevinfarrugia/cache-control">GitHub</a> | 
        <a href="https://imkev.dev/cache-control">Getting your HTTP Cache-Control headers right
        </a>
      </p>
    </div>
    <script>
      const getTime = (date) =>
        \`\$\{date.getHours().toString().padStart(2, "0")\}:\$\{date
          .getMinutes()
          .toString()
          .padStart(2, "0")\}:\$\{date.getSeconds().toString().padStart(2, "0")\}\`;

      let date = new Date();
      document.getElementById("time").innerHTML = getTime(date);

      setInterval(() => {
        date = new Date();
        document.getElementById("time").innerHTML = getTime(date);
      }, 1000);
    </script>
  </body>
  </html>
`;

const server = createServer((request, response) => {
  // error handling
  request.on("error", (err) => {
    console.error(err);
    response.writeHead(500);
    response.end();
  });

  response.on("error", (err) => {
    console.error(err);
  });

  // don't handle requests for /favicon.ico
  if (request.url === "/favicon.ico") {
    response.writeHead(404);
    response.end();
    return;
  }

  // static asset
  if (/.+\.css$/.test(request.url)) {
    response.writeHead(200, {
      "cache-control": "max-age=3153600",
    });
    response.end(getStyle());
    return;
  }

  switch (request.url) {
    case "/no-store": {
      const html = getHtml({
        title: "no-store",
      });

      response.writeHead(200, {
        "cache-control": "no-store",
      });
      response.end(html);
      break;
    }
    case "/no-cache": {
      const html = getHtml({
        title: "private, no-cache",
      });
      const etag = md5(html);

      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "private, no-cache",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/public-no-cache": {
      const html = getHtml({
        title: "public, no-cache",
      });
      const etag = md5(html);

      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "public, no-cache",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/max-age-0": {
      const html = getHtml({
        title: "private, max-age=0",
      });
      const etag = md5(html);

      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "private, max-age=0",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/public-max-age-0-must-revalidate": {
      const html = getHtml({
        title: "public, max-age=0, must-revalidate",
      });
      const etag = md5(html);

      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "public, max-age=0, must-revalidate",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/public-max-age-60": {
      const html = getHtml({
        title: "public, max-age=60",
      });
      const etag = md5(html);

      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "public, max-age=60",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/public-max-age-60-must-revalidate": {
      const html = getHtml({
        title: "public, max-age=60, must-revalidate",
      });
      const etag = md5(html);

      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "public, max-age=60, must-revalidate",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/max-age-60-stale-while-revalidate-60": {
      const html = getHtml({
        title: "private, max-age=60, stale-while-revalidate=60",
      });
      const etag = md5(html);

      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "private, max-age=60, stale-while-revalidate=60",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/public-max-age-10-stale-while-revalidate-10-stale-if-error-60": {
      const html = getHtml({
        title:
          "public, max-age=10, stale-while-revalidate=10, stale-if-error=60",
      });
      const etag = md5(html);

      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control":
            "public, max-age=10, stale-while-revalidate=10, stale-if-error=60",
          etag,
        });
        response.end(html);
      }
      break;
    }
    default: {
      const html = getHtml({
        title: "HOME",
      });
      response.writeHead(200);
      response.end(html);
      break;
    }
  }
});

server.listen(3000);

console.log("Server started on http://localhost:3000");
