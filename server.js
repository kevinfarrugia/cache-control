import { createServer } from "http";

const getHtml = ({ title }) => `
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <h1>${title}</h1>
    <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloribus dicta id, tempora rem accusamus ab ex, ratione ad exercitationem libero laudantium fugit reiciendis corrupti quis ipsam dolorum maxime perspiciatis nemo?</p>
  </body>
  </html>
`;

const server = createServer((request, response) => {
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
    default: {
      response.writeHead(200);
      response.end(getHtml({ title: "HOME" }));
      break;
    }
  }
});

server.listen(3000);

console.log("Server started on http://localhost:3000");
