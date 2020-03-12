import { Application } from "pixi.js";
import { Gold } from "./world/things/stackable/items/gold";
import { Grid } from "./world/grid";
import { Screen } from "./render/screen";
import { Universe } from "./world/universe";

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

const universe: Universe = new Universe();
universe.maps.push(new Grid({ universe, worlds: new Set(["default"]), x: 150, y: 150, z: 1 }));
universe.maps[0].locations.forEach(function(cell) {
	cell.occupants.push(new Gold({ kind: "default", parent: cell, world: "default" }));
});

const screen: Screen = new Screen({
	app,
	maps: universe.getInstance().maps
});
