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
					<!--Modal header-->
					<div class="modal-header">
						<h5 id="ui-debug-label" class="modal-title">Modal title</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
					</div>

					<!--Modal body-->
					<div class="modal-body">
						<!--Static card-->
						<div class="card">
							<ul class="list-group">
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

						<!--Tabbed card-->
						<div class="card">
							<!--Card header-->
							<div class="card-header">
								<ul class="nav nav-tabs card-header-tabs" role="tablist">
									<!--Map link-->
									<li class="nav-item" role="presentation">
										<a
											id="ui-debug-tab-map"
											class="nav-link active"
											data-bs-toggle="tab"
											data-bs-target="#ui-debug-panel-map"
											role="tab"
											aria-controls="ui-debug-panel-map"
											aria-selected="true"
											aria-current="true"
											href="#"
											>Map</a
										>
									</li>

									<!--Uuid link-->
									<li class="nav-item" role="presentation">
										<a
											id="ui-debug-tab-uuid"
											class="nav-link"
											data-bs-toggle="tab"
											data-bs-target="#ui-debug-panel-uuid"
											role="tab"
											aria-controls="ui-debug-panel-uuid"
											aria-selected="false"
											href="#"
											>UUID</a
										>
									</li>
								</ul>
							</div>

							<!--Panels-->
							<div class="tab-content">
								<!--Map options-->
								<div id="ui-debug-panel-map" class="tab-pane active" role="tabpanel" aria-labelledby="ui-debug-tab-map">
									<ul class="list-group">
										<li class="list-group-item">
											<div class="form-check form-switch">
												<input id="show-grid" class="form-check-input" type="checkbox" />
												<label class="form-check-label" for="show-grid">Show grid</label>
											</div>
										</li>
									</ul>
								</div>

								<!--Uuid options-->
								<div id="ui-debug-panel-uuid" class="tab-pane" role="tabpanel" aria-labelledby="ui-debug-tab-uuid">
									<ul class="list-group">
										<li class="list-group-item">
											<!--Label-->
											<div class="d-flex flex-row justify-content-between">
												<div>Player</div>
												<button type="button">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="16"
														height="16"
														fill="currentColor"
														class="bi bi-clipboard"
														viewBox="0 0 16 16"
													>
														<path
															d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"
														/>
														<path
															d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"
														/>
													</svg>
												</button>
											</div>

											<!--UUID-->
											<highlightjs language="plaintext" :code="playerUuid" />
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	/**
	 * Vue data.
	 *
	 * @returns Component data
	 */
	data() {
		return { playerUuid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" };
	}
});
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
