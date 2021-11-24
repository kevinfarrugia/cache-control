import { createHash } from "crypto";
import { createServer } from "http";

const md5 = (input) => createHash("md5").update(input).digest("hex");

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

const getTime = (date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

const getHtml = ({ title, text }) => `
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${getStyle()}</style>
  </head>
  <body>
    <h1>${title}</h1>
    <pre>${text || ""}</pre>
    <p>
      Generated at: <strong>${getTime(new Date())}</strong>
    </p>
    <nav>
      <a href="/1">1</a>
      <a href="/2">2</a>
      <a href="/3">3</a>
      <a href="/4">4</a>
      <a href="/5">5</a>
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

  switch (request.url) {
    case "/1": {
      const html = getHtml({ title: "1", text: "no-store" });

      response.writeHead(200, {
        "cache-control": "no-store",
      });
      response.end(html);
      break;
    }
    case "/2": {
      const html = getHtml({ title: "2", text: "no-cache" });
      const etag = md5(html);

      // if the ETAG matches the if-none-match header then respond with 304
      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "no-cache",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/3": {
      const html = getHtml({ title: "3", text: "max-age=0, must-revalidate" });
      const etag = md5(html);

      // if the ETAG matches the if-none-match header then respond with 304
      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "max-age=0, must-revalidate",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/4": {
      const html = getHtml({
        title: "4",
        text: "max-age=600, must-revalidate",
      });
      const etag = md5(html);

      // if the ETAG matches the if-none-match header then respond with 304
      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "max-age=600, must-revalidate",
          etag,
        });
        response.end(html);
      }
      break;
    }
    case "/5": {
      const html = getHtml({ title: "5", text: "max-age=600" });
      const etag = md5(html);

      // if the ETAG matches the if-none-match header then respond with 304
      if (etag === request.headers["if-none-match"]) {
        response.writeHead(304);
        response.end();
      } else {
        response.writeHead(200, {
          "cache-control": "max-age=600",
          etag,
        });
        response.end(html);
      }
      break;
    }
    default: {
      const html = getHtml({ title: "HOME" });
      response.writeHead(200);
      response.end(html);
      break;
    }
  }
});

server.listen(3000);

console.log("Server started on http://localhost:3000");
