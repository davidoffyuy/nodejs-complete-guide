const fs = require("fs");

const requestHandler = (req, res) => {
  const method = req.method;
  const url = req.url;

  if (url === "/") {
    res.write("<html>");
    res.write("<head><title>enter message</title></head>");
    res.write(
      '<body><form action="/message" method="post"><input type="text" name="message" /><button type="submit">Send</button></form></body>'
    );
    res.write("</html>");
    return res.end();
  }

  if (url === "/message" && method === "POST") {
    const body = [];
    req.on("data", chunk => {
      console.log(chunk);
      body.push(chunk);
    });
    return req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split("=")[1];
      fs.writeFile("test.txt", message, err => {
        res.statusCode = 302;
        res.setHeader("Location", "/");
        return res.end();
      });
    });
  }

  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<head>");
  res.write("<title>first page</title>");
  res.write("</head>");
  res.write("<body>but not the last</body>");
  res.write("</html>");
  res.end();
};

module.exports = requestHandler;