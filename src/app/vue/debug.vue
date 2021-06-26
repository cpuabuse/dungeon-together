<!--Component to display the debug menu-->

<template>
	<div>
		<!--Button trigger-->
		<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#ui-debug">Debug</button>

		<!--Modal-->
		<div
			id="ui-debug"
			class="modal fade"
			tabindex="-1"
			aria-labelledby="ui-debug-label"
			aria-hidden="true"
			data-bs-backdrop="false"
		>
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 id="ui-debug-label" class="modal-title">Modal title</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
					</div>
					<div class="modal-body">
						<!--Too much space between the borderless header and the body-->
						<div class="card">
							<ul class="list-group debug">
								<li class="list-group-item d-flex justify-content-between align-items-center">
									Time
									<span class="badge bg-primary rounded-pill">14</span>
								</li>
								<li class="list-group-item d-flex justify-content-between align-items-center">
									Version
									<span class="badge bg-primary rounded-pill">2</span>
								</li>
								<li class="list-group-item d-flex justify-content-between align-items-center">
									Current level
									<span class="badge bg-primary rounded-pill">1</span>
								</li>
							</ul>
						</div>
						<div class="card">
							<ul class="list-group debug">
								<li class="list-group-item d-flex justify-content-between align-items-center">
									<div class="form-check form-switch">
										<input id="show-grid" class="form-check-input" type="checkbox" />
										<label class="form-check-label" for="show-grid">Show grid</label>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style scoped>
/* Make cards looks nice inside of modal */
#ui-debug .modal-header {
	border-bottom: none;
}
#ui-debug .modal-body {
	padding-top: 0;
}

/* Spacing between cards */
#ui-debug .card + .card {
	margin-top: 1rem;
}
</style>
