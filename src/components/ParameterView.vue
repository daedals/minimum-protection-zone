<template>
	<v-expansion-panel>
		<v-expansion-panel-title>
			<template v-slot:default="{ expanded }">
				<v-row no-gutters>
					<v-col class="d-flex justify-start" cols="4"> 2. Edit parameters </v-col>
					<v-col class="text-grey" cols="8">
						<span v-if="expanded" key="0"> Edit the parameters to your liking and apply them. </span>
						<span v-else key="1"></span>
					</v-col>
				</v-row>
			</template>
		</v-expansion-panel-title>
		<v-expansion-panel-text>
			<p> here go the parameters </p>
			<v-col class="text-right">
				<v-btn
					text="Apply"
					:disabled="btnDisabled"
					@click="applyParameters"
				></v-btn>
			</v-col>
		</v-expansion-panel-text>
	</v-expansion-panel>
</template>

<script setup lang="ts">
	import { ref, type Ref } from 'vue'

	// UI refs
	const btnDisabled : Ref<boolean> = ref(false)

	// logic refs

	function applyParameters() {

	}

</script>