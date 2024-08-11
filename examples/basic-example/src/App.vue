<script setup lang="ts">
import {
	CategoryScale,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
	TimeScale,
} from "chart.js";
import { useChartJs, useChartJsData, useChartJsOptions } from "vue-chartjs-composables";

const data = useChartJsData<"line">(() => ({
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
			label: "My First dataset",
			data: [65, 59, 80, 81, 56, 55, 40],
			fill: false,
			backgroundColor: "rgb(75, 192, 192)",
			borderColor: "rgb(53, 162, 235)",
			tension: 0.4,
		},
	],
}));

const options = useChartJsOptions<"line">(() => ({}));

const { canvasRef, containerRef } = useChartJs<"line">("line", data, options, {
	modules: [LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale],
});
</script>

<template>
	<main class="container">
		<div ref="containerRef" class="chart">
			<canvas ref="canvasRef" />
		</div>
	</main>
</template>

<style scoped>
.container {
	height: 1000px;
}

.chart {
	position: relative;
	height: 100%;
}
</style>
