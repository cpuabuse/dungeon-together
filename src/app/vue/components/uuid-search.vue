<!--
	Search component.
-->

<template>
	<VTextField
		v-model="model"
		density="compact"
		variant="solo"
		label="Search templates"
		append-inner-icon="fa-magnifying-glass"
		single-line
		hide-details
		@click:append-inner="onClick"
	></VTextField>

	<VCheckbox v-model="isNotFoundLogged" label="Log not found"></VCheckbox>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { VCheckbox, VTextField } from "vuetify/components";
import { useStore } from "vuex";
import { ClientEntity } from "../../client/entity";
import { UniverseState, UniverseStore } from "../../client/gui";
import { Uuid } from "../../common/uuid";
import { LogLevel } from "../../core/error";

/**
 * Model for text field.
 */
const model: Ref<string> = ref("");

/**
 * Log UUID that are not found are not.
 */
const isNotFoundLogged: Ref<boolean> = ref(false);

/**
 * Universe store.
 */
const {
	state: { universe }
}: UniverseStore = useStore<UniverseState>();

/**
 * On click callback.
 */
function onClick(): void {
	/**
	 * Local message array type.
	 */
	type Message = Parameters<(typeof universe)["log"]>[0];

	let uuid: Uuid = model.value;
	let entity: ClientEntity = universe.getEntity({ entityUuid: uuid });
	let isEntityFound: boolean = entity.entityUuid === uuid;

	let messages: Array<Message> = new Array<Message>();
	if (isEntityFound || isNotFoundLogged.value) {
		messages.push({
			data: entity,
			level: LogLevel.Informational,
			message: `Entity ${isEntityFound ? "" : "NOT "}found with UUID="${uuid}")`
		});
	}

	if (messages.length) {
		messages.forEach(message => universe.log(message));
	} else {
		universe.log({
			level: LogLevel.Informational,
			message: `Nothing found with UUID="${uuid}")`
		});
	}
}
</script>

<style lang="css"></style>
