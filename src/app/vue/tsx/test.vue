<script lang="tsx">
import interact from "interactjs";
import { defineComponent } from "vue";
import { ThisVueStore } from "../../client/gui";

/**
 * @param event - Event recieved
 */
function dragMoveListener(event: {
	/**
	 * Element.
	 */
	target: HTMLElement;

	/**
	 * X coordinate.
	 */
	dx: number;

	/**
	 * Y coordinate.
	 */
	dy: number;
}): void {
	let {
		target
	}: {
		/**
		 * HTML element
		 */
		target: HTMLElement;
	} = event;

	// Keep the dragged position in the data-x/data-y attributes
	let x: number = (parseFloat(target.getAttribute("data-x") as string) || 0) + event.dx;
	let y: number = (parseFloat(target.getAttribute("data-y") as string) || 0) + event.dy;

	// Translate the element
	target.style.transform = `translate(${x}px, ${y}px)`;

	// Update the posiion attributes
	target.setAttribute("data-x", x.toString());
	target.setAttribute("data-y", y.toString());
}

/**
 * Root component.
 */
export default defineComponent({
	/**
	 * Update timer every second.
	 */
	created() {
		setInterval(() => {
			this.$data.what = (this as unknown as ThisVueStore).$store.state.universe.application.state.upTime;
		}, 1000);
	},

	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		return {
			what: 0
		};
	},

	/**
	 * Refs accessible only after mount.
	 */
	mounted() {
		interact(this.$el).draggable({
			listeners: {
				// call this function on every dragmove event
				move: dragMoveListener
			},

			// keep the element within the area of it's parent
			modifiers: [
				interact.modifiers.restrictRect({
					endOnly: true
				})
			]
		});
	},

	/**
	 * TSX render function.
	 *
	 * @returns - HTML
	 */
	render() {
		return (
			<div class="card" style="width: 18rem;">
				<div class="card-body">
					<h5 class="card-title">Card title</h5>
					<h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6>
					<p class="card-text">
						Some quick example text to build on the card title and make up the bulk of the card's content.
					</p>
					<a href="#" class="card-link">
						Card link
					</a>
					<a href="#" class="card-link">
						Another link
					</a>
				</div>
			</div>
		);
	}
});
</script>
<style>
.tsxtest {
	background: blue;
}
</style>
