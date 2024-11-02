import { ApiRoute } from "@mds-coding/api-route";
import { HttpMethod } from "@mds-coding/http-method";
import { HttpRequest } from "@mds-coding/http-request";
import express  from "express";
import http from "http";

export class Api {
  app: express.Express;
  port: number;
  server: http.Server | null;

  constructor(port: number) {
    this.app = express();
    this.app.use(express.json());
    this.port = port;
    this.server = null;
  }

  start() {
    this.server = this.app.listen(this.port);
  }

  addRoute<T, U>(route: ApiRoute<T, U>) {
    this.app[route.method](route.path, (req, res) => {
      // Convert to HttpRequest
      // TODO headers
      const httpRequest = new HttpRequest(stringToHttpMethod(req.method), req.path, {}, req.body);

      // Handle
      const httpResponse = route.handler(httpRequest);

      // Extract HttpResponse to Express' response
      res.statusCode = httpResponse.statusCode;
      res.statusMessage = httpResponse.statusMessage;
      Object.values(httpResponse.headers).forEach(([key, value]) => res.setHeader(key, value));
      res.json(httpResponse.body);
      res.end();
    });
  }

  async stop() {
    return new Promise<void>((res, rej) => {
      if (this.server === null) {
        rej();
        return;
      }

      this.server.close(() => res());
    })
  }
}

function stringToHttpMethod(str: string): HttpMethod {
  if (str === "GET") {
    return 'get';
  }

  if (str === "POST") {
    return 'post';
  }

  if (str === "PATCH") {
    return 'patch';
  }

  if (str === "PUT") {
    return 'put';
  }

  if (str === "DELETE") {
    return 'delete';
  }

  throw new Error("Does not match an HttpMethod")
}
