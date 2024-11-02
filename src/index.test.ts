import { ApiRoute } from "@mds-coding/api-route";
import { Api } from "./index.js"
import { HttpResponse } from "@mds-coding/http-response";
import supertest from "supertest";

test("`Api` can be created and called", async () => {
  return new Promise<void>((res, rej) => {
    // Init API
    const route = new ApiRoute<{ hello: number }, { world: number }>('get', '/foo', (req) => {
      return new HttpResponse(200, "OK", {}, { world: req.body.hello * 2 });
    })
    const api = new Api(4242);
    api.addRoute(route);

    // Start API
    api.start();

    // Request API
    supertest("http://localhost:4242").get("/foo").send({ hello: 42 })
      .set("Content-Type", "application/json")
      .expect(200, { world: 84 })
      .expect("Content-Type", "application/json; charset=utf-8")
      .end(async (err) => {
        await api.stop();

        if (err) {
          return rej(err);
        }

        res();
      });
  })
})
