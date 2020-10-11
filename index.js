"use strict";

const Promise = global.Promise || require("promise");
const port = process.env.PORT || 3000

const express = require("express");
const exphbs = require("express-handlebars"); // "express-handlebars"
const helpers = require("./lib/helpers");

const app = express();

// Create `ExpressHandlebars` instance with a default layout.
const hbs = exphbs.create({
	helpers,

	// Uses multiple partials dirs, templates in "shared/templates/" are shared
	// with the client-side of the app (see below).
	partialsDir: [
		"shared/templates/",
		"views/partials/",
	],
});

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Middleware to expose the app's shared templates to the client-side of the app
// for pages which need them.
function exposeTemplates (req, res, next) {
	// Uses the `ExpressHandlebars` instance to get the get the **precompiled**
	// templates which will be shared with the client-side of the app.
	hbs.getTemplates("shared/templates/", {
		cache: app.enabled("view cache"),
		precompiled: true,
	}).then(function (templates) {
		// RegExp to remove the ".handlebars" extension from the template names.
		const extRegex = new RegExp(hbs.extname + "$");

		// Creates an array of templates which are exposed via
		// `res.locals.templates`.
		templates = Object.keys(templates).map(function (name) {
			return {
				name: name.replace(extRegex, ""),
				template: templates[name],
			};
		});

		// Exposes the templates during view rendering.
		if (templates.length) {
			res.locals.templates = templates;
		}

		setImmediate(next);
	})
		.catch(next);
}

app.get("/", function (req, res) {
	res.render("home", {
		title: "Handlebars",
	});
});

app.get("/yell", function (req, res) {
	res.render("yell", {
		title: "Yell",

		// This `message` will be transformed by our `yell()` helper.
		message: "Hi, I am yelling.",
	});
});

app.get("/exclaim", function (req, res) {
	res.render("yell", {
		title: "Exclaim",
		message: "This adds three exclamation points the end of anything",

		// This overrides _only_ the default `yell()` helper.
		helpers: {
			yell (msg) {
				return (msg + "!!!");
			},
		},
	});
});

app.get("/echo/:message?", exposeTemplates, function (req, res) {
	res.render("echo", {
        title: "Echo",
        comment: "I actually don't quite understand what echo does...",
		message: req.params.message,

		// Overrides which layout to use, instead of the defaul "main" layout.
		layout: "shared-templates",

		partials: Promise.resolve({
			echo: hbs.handlebars.compile("<p>ECHO: {{message}}</p>"),
		}),
	});
});

app.use(express.static("public/"));



app.listen(port, () => console.log(`Listening on port ${port}...`))