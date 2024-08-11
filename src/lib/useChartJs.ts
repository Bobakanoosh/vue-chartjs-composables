import {
	Chart,
	ChartComponentLike,
	ChartData,
	ChartOptions,
	ChartType,
	DefaultDataPoint,
	Plugin,
} from "chart.js";
import { ref, toValue, watch } from "vue";
import { tryOnMounted, useElementBounding, useElementSize } from "@vueuse/core";

export type AsyncModule<TType extends ChartType = ChartType> = () => Promise<{
	default: Plugin<TType>;
}>;

export interface UseChartJsConfig<TType extends ChartType = ChartType> {
	modules?: ChartComponentLike[];
	asyncModules?: AsyncModule[];
	plugins?: Plugin<TType>[];
	autoInit?: boolean;
}

export function useChartJs<
	TType extends ChartType = ChartType,
	TData = DefaultDataPoint<TType>,
	TLabel = unknown,
>(
	type: TType,
	data: (chart: Chart<TType, TData, TLabel> | undefined) => ChartData<TType, TData, TLabel>,
	chartOptions: () => ChartOptions<TType>,
	config?: UseChartJsConfig<TType>,
) {
	const { modules = [], asyncModules = [], plugins, autoInit = true } = config ?? {};

	let _chart: Chart<TType, TData, TLabel>;

	const chartRef = ref<Chart<TType, TData, TLabel>>();
	const canvasRef = ref<HTMLCanvasElement | null>(null);
	const containerRef = ref<HTMLDivElement | null>(null);
	const containerSize = useElementBounding(containerRef);

	function init() {
		if (!canvasRef.value) {
			throw new Error(`Canvas not found`);
		}

		_chart?.destroy();
		_chart = new Chart(canvasRef.value, {
			type,
			data: data(_chart),
			options: toValue(chartOptions),
			// TODO: Fix this, no idea why it's not working
			plugins: plugins as unknown as any,
		}) as Chart<TType, TData, TLabel>;

		_chart.data = data(_chart);
		_chart.update();
		chartRef.value = _chart;
	}

	// const ChartCanvas = h("canvas", { ref: canvasRef });
	// const ChartComponent = defineComponent({
	// 	name: "Chart",
	// 	setup(props, { slots }) {
	// 		return h("div", { ref: containerRef, class: "relative" }, [
	// 			slots.default ? slots.default() : ChartCanvas,
	// 		]);
	// 	},
	// });

	watch([() => data(_chart), chartOptions], ([newData, newOptions]) => {
		if (!_chart) {
			return;
		}

		if (newOptions) {
			_chart.options = newOptions;
		}

		_chart.data = newData;
		_chart.update();
	});

	watch([containerSize.width, containerSize.height], ([width, height]) => {
		_chart?.resize(width, height);
		_chart?.update();
	});

	registerModules(modules, asyncModules).then(() => _chart?.update());
	if (autoInit) {
		tryOnMounted(init);
	}

	return {
		init,
		// ChartComponent,
		// ChartCanvas,
		canvasRef,
		containerRef,
		chart: chartRef,
	};
}

function registerModules(modules: ChartComponentLike[], asyncModules: AsyncModule[]) {
	Chart.register(...modules);
	return Promise.all(asyncModules.map((module) => module())).then((resolvedAsyncModules) => {
		const moduleDefaults = resolvedAsyncModules.map((module) => module.default);
		Chart.register(...moduleDefaults);
	});
}
