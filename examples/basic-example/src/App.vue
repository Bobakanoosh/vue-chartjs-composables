<script setup lang="ts">
import {
	CategoryScale,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
	TimeScale,
} from "chart.js";
import { computed, ref } from "vue";
import {
	useChartJs,
	useChartJsData,
	useChartJsOptions,
	useChartJsComponent,
} from "vue-chartjs-composables";

const DATA = [
	{ month: "January", amount: 65 },
	{ month: "February", amount: 59 },
	{ month: "March", amount: 80 },
	{ month: "April", amount: 81 },
	{ month: "May", amount: 56 },
	{ month: "June", amount: 55 },
	{ month: "July", amount: 40 },
	{ month: "August", amount: 63 },
	{ month: "September", amount: 70 },
	{ month: "October", amount: 85 },
	{ month: "November", amount: 100 },
	{ month: "December", amount: 120 },
];

const numberOfDataSets = ref(6);
const labels = computed(() => DATA.map(({ month }) => month).slice(0, numberOfDataSets.value));
const dataPoints = computed(() =>
	DATA.map(({ amount }) => amount).slice(0, numberOfDataSets.value),
);

const data = useChartJsData<"line">(() => ({
	labels: labels.value,
	datasets: [
		{
			label: "My First dataset",
			data: dataPoints.value,
			fill: false,
			backgroundColor: "rgb(75, 192, 192)",
			borderColor: "rgb(53, 162, 235)",
			tension: 0.4,
		},
	],
}));

const options = useChartJsOptions<"line">(() => ({
	animation: false,
	plugins: {},
}));

async function zoom() {
	return import("chartjs-plugin-zoom");
}

const instance = useChartJs("line", data, options, {
	modules: [LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale],
	plugins: [zoom],
});

const [ChartComponent] = useChartJsComponent(instance);
</script>

<template>
	<main class="container">
		<div class="controls">
			<button @click="numberOfDataSets += 1">Add data set</button>
			<button @click="numberOfDataSets -= 1">Remove data set</button>
		</div>
		<ChartComponent />
	</main>
</template>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	height: 800px;
	padding: 2rem;
}

.chart {
	position: relative;
	height: 100%;
}

.controls {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

button {
	background-color: #646bd6;
	border: none;
	padding: 0.5rem 1rem;
	color: white;
	border-radius: 0.5rem;
}
</style>
