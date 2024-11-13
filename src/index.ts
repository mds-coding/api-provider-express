import { ApiRoute } from "@mds-coding/api-route";
import { HttpMethod, HttpRequest } from "@mds-coding/http";
import express from "express";
import http from "http";

type ExpressMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export class ApiProviderExpress {
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
    const expressMethod = route.method.toLowerCase() as ExpressMethod;
    this.app[expressMethod](route.path, (req, res) => {
      // Convert to HttpRequest
      // TODO headers
      const method: HttpMethod = stringToHttpMethod(req.method);
      const httpRequest = new HttpRequest(method, req.path, {}, req.body);

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
    return 'GET';
  }

  if (str === "POST") {
    return 'POST';
  }

  if (str === "PATCH") {
    return 'PATCH';
  }

  if (str === "PUT") {
    return 'PUT';
  }

  if (str === "DELETE") {
    return 'DELETE';
  }

  if (str === "OPTION") {
    return 'OPTION';
  }

  throw new Error("Does not match an HttpMethod")
}
