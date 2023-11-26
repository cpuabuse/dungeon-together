<template>
	<div>
		<strong>Controls</strong>
		<dl>
			<dt>W</dt>
			<dd>Move up/Attack</dd>

			<dt>A</dt>
			<dd>Move left/Attack</dd>

			<dt>S</dt>
			<dd>Move down/Attack</dd>

			<dt>D</dt>
			<dd>Move right/Attack</dd>
		</dl>
	</div>

	<VDivider />

	<div>
		<strong>Cell</strong>
		<p>Right-click to open a cell menu</p>
	</div>

	<VDivider />

	<div>
		<strong>Entity</strong>
		<ul>
			<li>Attack</li>
			<li>Use</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VDivider } from "vuetify/components";

export default defineComponent({
	components: { VDivider }
});
</script>

<style scoped lang="css"></style>
