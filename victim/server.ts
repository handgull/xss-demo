import {
  Application,
  Context,
  Router,
  send,
} from "https://deno.land/x/oak/mod.ts";
import { bold, yellow } from "https://deno.land/std@0.77.0/fmt/colors.ts";

const app = new Application();
const router = new Router();

app.use(router.routes());

/* logging */
app.addEventListener("listen", ({ hostname, port }) => {
  console.log(
    bold("Start listening on ") + yellow(`${hostname}:${port}`),
  );
});

app.use(async (ctx: Context, next: () => Promise<void>) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

app.use(async (ctx: Context, next: () => Promise<void>) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});
/* fine logging */

// servo i files statici del frontend
app.use(async (ctx: Context) => {
  const reqPath = ctx.request.url.pathname;
  await send(ctx, reqPath, {
    root: `${Deno.cwd()}/frontend`,
    index: "index.html",
  });
});

export const saveBadCode = async ({
  request,
  response,
}: {
  request: any;
  response: any;
}) => {
  try {
    const body = await request.body();
    const values = await body.value;
    const script = values.badCode;
    if (!script) {
      throw ("badCode field should have a value");
    }
    await Deno.writeTextFile("./badCode.txt", script);

    response.body = { msg: "bad code saved 😈" };
    response.status = 200;
  } catch (e) {
    response.body = { msg: e };
    response.status = 400;
  }
};

router.get("/get-token", (ctx: Context) => {
  ctx.cookies.set("creationDate", new Date().toISOString());
  const token = "reallySecretShit" + Math.floor(Math.random() * 100) + 1;
  ctx.cookies.set("token", token, { httpOnly: true, sameSite: true }); // in oak httpOnly è già true di default, grazie a strict il token sarà rubato solo in localhost
  ctx.response.body = { token, msg: "added some 🍪" };
});

router.post("/inject", saveBadCode);

router.get("/bad-code", async (ctx: Context) => {
  try {
    ctx.response.body = { badCode: await Deno.readTextFile("./badCode.txt") };
  } catch {
    ctx.response.body = { msg: "no bad code available" };
    ctx.response.status = 500;
  }
});

await app.listen({ hostname: "localhost", port: 3000 });
