const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const render = require("koa-ejs");
const path = require("path");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");

const manage = require("./routes/manage");
const article = require("./routes/article");

// error handler
onerror(app);

// middlewares
app.use(
    bodyparser({
        enableTypes: ["json", "form", "text"]
    })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(path.join(__dirname, "assets"), { defer: false }));
/*
app.use(
    views(__dirname + "/views", {
        extension: "pug"
    })
);
*/
render(app, {
    root: path.join(__dirname, "views"),
    layout: "template",
    viewExt: "ejs", // *.ejs
    cache: false,
    debug: true /*@TODO false*/
});

// logger
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(manage.routes(), manage.allowedMethods());
app.use(article.routes(), article.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
    console.error("server error", err, ctx);
});

module.exports = app;
