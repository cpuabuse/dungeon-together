<template>
	<div>
		<div>
			<strong>How to play</strong>
			<p class="pt-2 pb-2">Descend to the lowest level of the dungeon, while defending against the monsters.</p>
		</div>

		<VDivider />

		<div class="pt-4">
			<strong>Keyboard controls</strong>
			<VRow class="align-center" justify="space-around">
				<!-- Movement section -->
				<VCol cols="auto">
					<VRow no-gutters justify="space-around">
						<VCol v-for="(panel, panelKey) in keyboardControlPanels" :key="panelKey" class="mx-2">
							<!-- First row of keys -->
							<VRow no-gutters justify="center">
								<VCol cols="auto">
									<VKbd class="universe-ui-toolbar-welcome-keyboard">{{ panel[0] }}</VKbd>
								</VCol>
							</VRow>

							<!-- Second row of keys -->
							<VRow class="flex-nowrap" no-gutters justify="center">
								<VCol v-for="(button, buttonKey) in panel.slice(1)" :key="buttonKey" cols="auto">
									<VKbd class="universe-ui-toolbar-welcome-keyboard">{{ button }}</VKbd>
								</VCol>
							</VRow>
						</VCol>
					</VRow>

					<!-- Description -->
					<VRow no-gutters><VCol class="text-center">Directional movement and attack</VCol></VRow>
				</VCol>

				<!-- Individual key section -->
				<VCol v-for="(panel, panelKey) in keyboardIndividualsPanels" :key="panelKey" cols="auto">
					<VRow v-for="(panelEntry, panelEntryKey) in panel" :key="panelEntryKey" no-gutters>
						<VCol cols="auto" align-self="center">
							<VKbd class="universe-ui-toolbar-welcome-keyboard">{{ panelEntry.keyboardKey }}</VKbd>
						</VCol>
						<VCol cols="auto" align-self="center">
							{{ panelEntry.description }}
							<template v-if="panelEntry.subtext">
								<br />
								<div class="text-subtitle-2">{{ panelEntry.subtext }}</div>
							</template>
						</VCol>
					</VRow>
				</VCol>
			</VRow>
		</div>

		<VDivider />

		<!-- Mouse control section -->
		<div class="pt-4">
			<strong>Mouse controls</strong>
			<VRow>
				<!-- Panel section -->
				<VCol align-self="center" class="text-center">
					<dl>
						<dt>Left-click</dt>
						<dd>Cancels selection</dd>
					</dl>
				</VCol>

				<VCol align-self="center">
					<div><BaseIcon icon="fa-mouse" class="d-flex justify-center mouse-icon" /></div>
				</VCol>

				<VCol align-self="center" class="text-center">
					<dl>
						<dt>Right-click</dt>
						<dd>Open contextual cell menu</dd>
					</dl>
				</VCol>
			</VRow>
		</div>

		<VDivider />

		<div class="pt-4">
			<strong>Entity</strong>
			<ul>
				<li class="d-flex align-center">
					<BaseIcon icon="fa-khanda" class="pr-1 pb-1 universe-ui-toolbar-welcome-ui-action" /> Attack
				</li>
				<li class="d-flex align-center">
					<BaseIcon icon="fa-hand" class="pr-1 pb-1 universe-ui-toolbar-welcome-ui-action" />Use
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VCol, VDivider, VKbd, VRow } from "vuetify/components";
import { BaseIcon } from "../components";

export default defineComponent({
	components: { BaseIcon, VCol, VDivider, VKbd, VRow },

	/**
	 * Keyboard values.
	 *
	 * @returns Keyboard values
	 */
	data(): {
		/**
		 * Keyboard keys for movement.
		 */
		keyboardControlPanels: Array<[string, string, string, string]>;

		/**
		 * Section for sets of keys and descriptions.
		 */
		keyboardIndividualsPanels: Array<
			Array<{
				/**
				 * Description of the keyboard key.
				 */
				description: string;

				/**
				 * Actual keyboard key.
				 */
				keyboardKey: string;

				/**
				 * Optional subtext for keyboard keys.
				 */
				subtext?: string;
			}>
		>;
	} {
		return {
			keyboardControlPanels: [
				["W", "A", "S", "D"],
				["↑", "←", "↓", "→"]
			] as const,
			keyboardIndividualsPanels: [
				[
					{ description: "Camera level up", keyboardKey: "O" },
					{ description: "Camera level down", keyboardKey: "P" }
				],
				[
					{ description: "Use", keyboardKey: "E", subtext: "(Use the ladder to descend)" },
					{ description: "Wait", keyboardKey: "R", subtext: "(Skip your turn)" },
					{ description: "Wait until healed", keyboardKey: "T", subtext: "(Or event/danger)" }
				]
			]
		};
	}
});
</script>

<style scoped lang="css">
.universe-ui-toolbar-welcome-keyboard {
	display: inline-block;
	scale: 2;
	margin: 1.5em;
	font-family: monospace, monospace;
}

li {
	list-style-type: none;
}

.mouse-icon {
	scale: 2;
	margin: 2em;
}

.universe-ui-toolbar-welcome-ui-action {
	scale: 1.5;
	margin: 1em;
}
</style>
