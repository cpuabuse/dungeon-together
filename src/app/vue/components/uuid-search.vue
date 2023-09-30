<!--
	Search component.
-->

<template>
	<!-- Prevent not to trigger potential parent form -->
	<VTextField
		v-model="model"
		label="Search templates"
		append-inner-icon="fa-magnifying-glass"
		hide-details
		variant="solo-filled"
		flat
		:loading="isLoading"
		@click:append-inner="onSearch"
		@keydown.enter.prevent="onSearch"
	></VTextField>

	<VCheckbox v-model="isNotFoundLogged" label="Log not found" hide-details></VCheckbox>
</template>

<script setup lang="ts">
import { Ref, ref, unref } from "vue";
import { VCheckbox, VTextField } from "vuetify/components";
import { useStore } from "vuex";
import { ClientEntity } from "../../client/entity";
import { UniverseState, UniverseStore } from "../../client/gui";
import { Uuid } from "../../common/uuid";
import { LogLevel } from "../../core/error";

/**
 * Return type of set timeout function.
 */
type TimeoutHandle = ReturnType<typeof setTimeout>;

/**
 * Time to wait before animation clears.
 */
const loadingTimeout: number = 1000;

/**
 * Model for text field.
 */
const model: Ref<string> = ref("");

/**
 * Log UUID that are not found are not.
 */
const isNotFoundLogged: Ref<boolean> = ref(false);

/**
 * Loading timeout handle.
 */
let loadingTimeoutHandle: Ref<TimeoutHandle | null> = ref(null);

/**
 * Universe store.
 */
const {
	state: { universe }
}: UniverseStore = useStore<UniverseState>();

/**
 * Loading animation triggered temporarily to indicate to user that search is/was processed.
 *
 * @remarks
 * Since search itself is almost instantaneous, the delay is to be used rather than completion of the search to remove animation.
 */
const isLoading: Ref<boolean> = ref(false);

/**
 * On click callback.
 */
function onSearch(): void {
	/**
	 * Local message array type.
	 */
	type Message = Parameters<(typeof universe)["log"]>[0];

	// Enable animation
	isLoading.value = true;

	// Process of removal of animation
	const loadingTimeoutHandleUnRef: TimeoutHandle | null = unref(loadingTimeoutHandle);
	if (loadingTimeoutHandleUnRef !== null) {
		clearTimeout(loadingTimeoutHandleUnRef);
	}
	loadingTimeoutHandle.value = setTimeout(() => {
		isLoading.value = false;
	}, loadingTimeout);

	let uuid: Uuid = model.value;
	let entity: ClientEntity = universe.getEntity({ entityUuid: uuid });
	let isEntityFound: boolean = entity.entityUuid === uuid;

	let messages: Array<Message> = new Array<Message>();
	if (isEntityFound || isNotFoundLogged.value) {
		messages.push({
			data: entity,
			level: LogLevel.Informational,
			message: `Entity ${isEntityFound ? "" : "NOT "}found with UUID="${uuid}"`
		});
	}

	if (messages.length) {
		messages.forEach(message => universe.log(message));
	} else {
		universe.log({
			level: LogLevel.Informational,
			message: `Nothing found with UUID="${uuid}"`
		});
	}
}
</script>

<style lang="css"></style>
