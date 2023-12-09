<template>
	<div>
		<div>
			<strong>Keyboard controls</strong>
			<VRow>
				<!-- Panel section -->
				<VCol v-for="(panel, panelKey) in keyboardControlPanels" :key="panelKey" align-self="center">
					<!-- keyboard panel -->
					<VContainer v-if="panel">
						<VRow no-gutters justify="center">
							<VCol cols="auto">
								<VKbd class="universe-ui-toolbar-welcome-keyboard">{{ panel[0] }}</VKbd>
							</VCol>
						</VRow>

						<!-- Description of movement -->
						<VRow no-gutters justify="center">
							<VCol v-for="(button, buttonKey) in panel.slice(1)" :key="buttonKey" cols="auto">
								<VKbd class="universe-ui-toolbar-welcome-keyboard">{{ button }}</VKbd>
							</VCol>
						</VRow>
					</VContainer>
					<div v-else class="text-center">Directional movement and attack</div>
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
			keyboardControlPanels: [["W", "A", "S", "D"], null, ["↑", "←", "↓", "→"]] as const
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
