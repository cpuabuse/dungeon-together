<template>
	<div>
		<div>
			<strong>How to play</strong>
			<p class="pt-2 pb-2">Descend to the lowest level of the dungeon, while defending against the monsters.</p>
		</div>

		<VDivider />

		<div>
			<strong>Keyboard controls</strong>
			<VRow class="align-center" justify="space-around">
				<!-- Movement section -->
				<VCol cols="auto">
					<VRow no-gutters>
						<VCol v-for="(panel, panelKey) in keyboardControlPanels" :key="panelKey">
							<VContainer>
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
							</VContainer>
						</VCol>
					</VRow>

					<!-- Description -->
					<VRow no-gutters><VCol class="text-center">Directional movement and attack</VCol></VRow>
				</VCol>

				<!-- Individual key section -->
				<VCol v-for="(panel, panelKey) in keyboardIndividualsPanels" :key="panelKey" cols="auto">
					<VRow v-for="(panelEntry, panelEntryKey) in panel" :key="panelEntryKey" no-gutters>
						<VCol cols="auto" align-self="center"
							><VKbd class="universe-ui-toolbar-welcome-keyboard">{{ panelEntry.key }}</VKbd></VCol
						>
						<VCol cols="auto" align-self="center">{{ panelEntry.description }}</VCol>
					</VRow>
				</VCol>
			</VRow>
		</div>

		<VDivider />

		<div>
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
				<li class="d-flex align-center"><BaseIcon icon="fa-khanda" class="pr-1 pb-1 icon" /> Attack</li>
				<li class="d-flex align-center"><BaseIcon icon="fa-hand" class="pr-1 pb-1 icon" />Use</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VCol, VContainer, VDivider, VKbd, VRow } from "vuetify/components";
import { BaseIcon } from "../components";

export default defineComponent({
	components: { BaseIcon, VCol, VContainer, VDivider, VKbd, VRow },

	/**
	 * Keyboard values.
	 *
	 * @returns Keyboard values
	 */
	data() {
		return {
			keyboardControlPanels: [
				["W", "A", "S", "D"],
				["↑", "←", "↓", "→"]
			] as const,
			keyboardIndividualsPanels: [
				[
					{ description: "Camera level up", key: "O" },
					{ description: "Camera level down", key: "P" }
				],
				[{ description: "Use", key: "E", subtext: "(Use the ladder to descend)" }]
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
</style>
