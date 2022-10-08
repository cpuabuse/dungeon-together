<template>
	<VBtn @click="dialog = true">Button</VBtn>

	<VDialog v-model="dialog">
		<VToolbar extended>
			<VToolbarTitle>Title</VToolbarTitle>
			<VBtn icon>
				<VIcon icon="fa-close" />
			</VBtn>
		</VToolbar>
	</VDialog>
</template>
