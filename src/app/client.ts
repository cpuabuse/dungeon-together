import { Screen } from "./render/screen";
import { Vao } from "./render/vao";
import { Application } from "pixi.js";
import { Square } from "./render/square";

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app: Application = new Application({
	height: window.innerHeight,
	transparent: true,
	width: window.innerWidth
});

window.addEventListener("resize", function() {
	app.renderer.resize(window.innerWidth, window.innerHeight);
});

window.addEventListener("wheel", function(args) {
	if (args.deltaY > 1) {
		app.stage.scale.x /= 1 + args.deltaY / 2000;
		app.stage.scale.y = app.stage.scale.x;
	} else if (args.deltaY < -1) {
		app.stage.scale.x *= 1 + Math.abs(args.deltaY) / 2000;
		app.stage.scale.y = app.stage.scale.x;
	}
});

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

const screen: Screen = new Screen({
	app,
	maps: [
		{
			locations: [{ occupants: [{ mode: "default" }] }, { occupants: [{ mode: "default" }], x: 1, y: 1 }]
		}
	]
});
