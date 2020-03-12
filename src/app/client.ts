import { Application, Texture, BaseTexture, groupD8 } from "pixi.js";
import { Gold } from "./world/things/stackable/items/gold";
import { Grid } from "./world/grid";
import { Screen } from "./render/screen";
import { Universe } from "./world/universe";
import { build, Dungeon, Tile } from "dungeoneer";
import { Guy } from "./world/things/exclusive/units/guy";
import { Wall } from "./world/things/exclusive/immovable/wall";
import { Door } from "./world/things/exclusive/immovable/door";
import { Floor } from "./world/things/exclusive/immovable/floor";
import { Cell } from "./world/cell";

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

const dungeon: Dungeon = build({ height: 51, width: 51 });

const universe: Universe = new Universe();

universe.maps.push(new Grid({ universe, worlds: new Set(["default"]), x: 51, y: 51, z: 1 }));
dungeon.tiles.forEach(function(tiles, x) {
	tiles.forEach(function(tile, y) {
		// Set cell
		let cell: Cell = universe.maps[0].locations[x * 51 + y];

		if (tile.neighbours.n) {
			cell.up = universe.maps[0].locations[x * tile.neighbours.n.x + tile.neighbours.n.y];
		}
		if (tile.neighbours.s) {
			cell.down = universe.maps[0].locations[x * tile.neighbours.s.x + tile.neighbours.s.y];
		}
		if (tile.neighbours.w) {
			cell.left = universe.maps[0].locations[x * tile.neighbours.w.x + tile.neighbours.w.y];
		}
		if (tile.neighbours.e) {
			cell.right = universe.maps[0].locations[x * tile.neighbours.e.x + tile.neighbours.e.y];
		}

		// Add relevant things
		switch (tile.type) {
			case "wall":
				// No need to store var during generation
				// eslint-disable-next-line no-new
				new Wall({ kind: "default", parent: cell, world: "default" });
				break;
			case "floor":
				// No need to store var during generation
				// eslint-disable-next-line no-new
				new Floor({ kind: "default", parent: cell, world: "default" });
				break;
			case "door":
				// No need to store var during generation
				// eslint-disable-next-line no-new
				new Door({ kind: "default", parent: cell, world: "default" });
				break;
			default:
		}
	});
});

const screen: Screen = new Screen({
	app,
	maps: universe.getInstance().maps,
	modes: {
		door: {
			textures: [new Texture(new BaseTexture("img/dungeontileset-ii/doors_leaf_closed.png"))]
		},
		floor: {
			textures: [new Texture(new BaseTexture("img/dungeontileset-ii/floor_1.png"))]
		},
		gold: {
			textures: [
				new Texture(new BaseTexture("img/dungeontileset-ii/coin_anim_f0.png")),
				new Texture(
					new BaseTexture("img/dungeontileset-ii/coin_anim_f0.png"),
					undefined,
					undefined,
					undefined,
					groupD8.MIRROR_HORIZONTAL
				),
				new Texture(
					new BaseTexture("img/dungeontileset-ii/coin_anim_f3.png"),
					undefined,
					undefined,
					undefined,
					groupD8.MIRROR_HORIZONTAL
				),
				new Texture(new BaseTexture("img/dungeontileset-ii/coin_anim_f2.png")),
				new Texture(new BaseTexture("img/dungeontileset-ii/coin_anim_f3.png"))
			]
		},
		wall: {
			textures: [new Texture(new BaseTexture("img/dungeontileset-ii/wall_mid.png"))]
		}
	}
});
