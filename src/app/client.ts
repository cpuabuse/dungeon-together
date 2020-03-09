import { Square, Vao } from "./render/vao";
import { Application, Sprite } from "pixi.js";

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

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

const vao: Vao = new Vao();
for (let i: number = 0; i < 10; i++) {
	vao.locations.push(new Square(app, { x: i }, [1]));
}
