<!--State alert component is informing the user while the state of the game is altered-->

<template>
	<div class="alert alert-primary d-flex align-items-center" role="alert">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			fill="currentColor"
			class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"
			viewBox="0 0 16 16"
			role="img"
			aria-label="Warning:"
		>
			<path :d="svgPath" />
		</svg>
		<div>{{ message }}</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AlertLevel } from "../client/gui/severity";

/**
 * Possible style classes for alert container.
 */
enum AlertClass {
	Primary = "alert-primary",
	Warning = "alert-warning",
	Danger = "alert-danger"
}

export default defineComponent({
	/**
	 * Computed for component.
	 *
	 * @returns - Computed object
	 */
	computed: {
		/**
		 * Constructs SVG path for an alert.
		 *
		 * @returns - SVG path
		 */
		svgPath(): string {
			return this.styles[this.level].svgPath;
		}
	},

	/**
	 * Data for component.
	 *
	 * @returns - Data object
	 */
	data() {
		let infoSvgPath: string =
			"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z";
		let warningSvgPath: string =
			"M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z";

		let data: {
			/**
			 * Alert level for the message.
			 */
			level: AlertLevel;

			/**
			 * The message to be displayed.
			 */
			message: string;

			/**
			 * Styles for alerts.
			 */
			styles: {
				[K in AlertLevel]: {
					/**
					 * SVG draw path.
					 */
					svgPath: string;

					/**
					 * Classe to be added to alert container.
					 */
					alertClass: AlertClass;
				};
			};
		} = {
			level: AlertLevel.Failure,
			message: "My customized value",
			styles: {
				[AlertLevel.Information]: {
					alertClass: AlertClass.Primary,
					svgPath: infoSvgPath
				},
				[AlertLevel.Warning]: {
					alertClass: AlertClass.Warning,
					svgPath: warningSvgPath
				},
				[AlertLevel.Failure]: {
					alertClass: AlertClass.Danger,
					svgPath: warningSvgPath
				}
			}
		};

		return data;
	}
});
</script>

<style scoped></style>
