"use strict";

const router = require("koa-router")();
const { toTitle } = require("../scripts/toTitle");
const antiInject = require("../scripts/antiInject");

const fs = require('fs');
const path = require("path");
const { promisify } = require('bluebird');
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const regex1 = /^slider\s*\(\s*(\w+)\s*\)\s*$/i,
    regex2 = /^end\s*$/i;
const md = require("markdown-it")({
    breaks: true,
    langPrefix: "lang-",
    linkify: true,
    typographer: false,
}).use(require("markdown-it-math"))
  .use(require('markdown-it-task-lists'))
  .use(require('markdown-it-container'), 'slider', {
    validate: function (params) {
        var str = params.trim();
        return regex1.test(str) || regex2.test(str);
    },
    render: function (tokens, idx) {
        const token = tokens[idx];
        const inf = token.info;
        if (regex1.test(inf)) {
            let m = toSafeHTML(inf.match(regex1));
            let UNIT = "px";
            if(isNaN(m[1])) {
                if(!isNaN(parseFloat(m[1]))) { // 100.0px
                    let num = parseFloat(m[1]);
                    UNIT = getUnit(m[1]);
                    m[1] = num.toString() + UNIT;
                }
            } else {
                m[1] += "px";
            }
            return `<div class="container">
            <div class="row headline">
                <!-- Begin Headline -->
                <div class="headline-slider" style="width: ${m[1]}; margin-left: calc(338.5px - ${parseFloat(m[1])/2}${UNIT}) !important;">
                    <div class="flexslider">
                        <div class="flex-viewport" style="overflow: hidden; position: relative;">
                            <ul class="slides" v-data="width:${m[1]};duration:2" style>\n`;
        } else if (regex2.test(inf)) {
            return `</ul>
            </div>
            <ul class="flex-direction-nav">
                <li>
                    <a class="flex-prev" href="#">Previous</a>
                </li>
                <li>
                    <a class="flex-next" href="#">Next</a>
                </li>
            </ul>
        </div>
    </div>
</div>
<!-- End Headline -->
</div>\n`;
        }
        return '';
    }
});

const slideList = require("../config/slideList.js");
const CONFIG  = require("../config/articleConfig.json");

router.prefix("/article");

router.get("/:title", async (ctx, next) => {
    /*
    let db = await MongoClient.connect(DB_CONN_STR);
    let result = await getData(db, ctx.params.title);
    db.close();
    let obj = result[0];
    */
    try {
        const fpath = path.join(__dirname, "../md/", ctx.params.title + ".md");
        const mdsource = (await readFile(fpath))
            .toString()
            .replace("\uFEFF", "")
            .replace(/^(#+)([^\s#])/gim, "$1 $2");
        const html = md.render(mdsource);
        let parsedTitle = html.match(/\<h1\>([\s\S]+?)\<\/h1\>/)[1];
        let hasSlide = false, slideImgs = [], slideParent = null;
        let imageSetting = null;
        //console.log(slideList, ctx.params.title);
        if(html.includes('<div class="flexslider">')) {
            hasSlide = true;
        }
        const articleConfig = CONFIG[ctx.params.title] || {};
        let post_date = new Date();
        if(articleConfig.datetime) {
            post_date = new Date(articleConfig.datetime).toDateString();
        } else {
            post_date = ((await stat(fpath)).mtime).toDateString();
        }
        let obj = {
            title: toTitle(ctx.params.title),
            main_html: html,
            description: articleConfig.description || "This page was generated by the THSCSLab Server automatically.",
            author: articleConfig.author || "THSCSLab",
            post_date: post_date,
        };
        if(hasSlide) {
            ctx.body = await ctx.render("slide", {
                title: parsedTitle || toTitle(obj.title),
                _title: ctx.params.title,
                description: obj.description,
                main_html: obj.main_html,
                post_date: obj.post_date,
                author: obj.author || "",
            });
        } else { 
            ctx.body = await ctx.render("article", {
                title: parsedTitle || toTitle(obj.title),
                _title: ctx.params.title,
                description: obj.description,
                main_html: obj.main_html,
                post_date: obj.post_date,
                author: obj.author || "",
            });
        }
    } catch (err) {
        console.log(err);
        ctx.status = 404;
        ctx.type = ".html";
        ctx.body = await ctx.render("error", {
            message: "Failed to fetch <code>/article/" + antiInject(ctx.params.title) + "</code>",
            error: {
                status: 404,
                stack: "Error 404 at article/:title"
            }
        })
    }
});

router.get("/", async (ctx, next) => {
    ctx.status = 302;
    ctx.redirect("/index");
})

async function sleep(ms = 0) {
    if(typeof ms !== "number")
        throw new TypeError("ms is not a number (in async sleep(...))");
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

function getUnit(str) {
    switch(true) {
        case /px$/i.test(str):
            return "px";
        case /vh$/i.test(str):
            return "vh";
        case /vw$/i.test(str):
            return "vw";
        case /em$/i.test(str):
            return "em";
        case /rem$/i.test(str):
            return "rem";
        case /\%$/i.test(str):
            return "%";
        case /pt$/i.test(str):
            return "pt";
        default:
            return "px";
    }
}

function toSafeHTML(arr) {
    return arr.map(str => {
        return str.replace(/>/g, "&gt;").replace(/</g, "&lt;");
    });
}

module.exports = router;
