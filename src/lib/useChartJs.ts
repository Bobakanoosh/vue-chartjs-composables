import {
	Chart,
	ChartComponentLike,
	ChartData,
	ChartOptions,
	ChartType,
	DefaultDataPoint,
	Plugin,
} from "chart.js";
import { Ref, ref, toValue, watch } from "vue";
import { useElementBounding, whenever } from "@vueuse/core";

export type AsyncPlugin<TType extends ChartType = any> = () => Promise<{
	default: Plugin<TType>;
}>;

export interface UseChartJsConfig<TType extends ChartType = ChartType> {
	/**
	 * Chart.js modules to register
	 *
	 * @example
	 * ```ts
	 * import { LineController, TimeScale, Tooltip } from "chart.js";
	 * {
	 * 	modules: [LineController, TimeScale, Tooltip]
	 * }
	 * ```
	 */
	modules?: ChartComponentLike[];
	/**
	 * Chart.js plugins to be used.
	 * Supports async plugins.
	 *
	 * @example
	 * ```ts
	 * import zoomPlugin from 'chartjs-plugin-zoom';
	 * {
	 * 	plugins: [zoomPlugin]
	 * }
	 * ```
	 *
	 * @example Asynchronous plugin
	 * ```ts
	 * {
	 * 	plugins: [import("chartjs-plugin-zoom")]
	 * }
	 * ```
	 */
	plugins?: Array<Plugin<TType> | AsyncPlugin<TType>>;
	/**
	 * When true, the chart will not be automatically initialized.
	 * When false, the chart will be automatically initialized whenever the canvasRef changes.
	 *
	 * @default false
	 */
	manual?: boolean;
}

export interface UseChartJsReturn<
	TType extends ChartType = ChartType,
	TData = DefaultDataPoint<TType>,
	TLabel = unknown,
> {
	init: () => void;
	canvasRef: Ref<HTMLCanvasElement | null>;
	containerRef: Ref<HTMLDivElement | null>;
	chart: Ref<Chart<TType, TData, TLabel> | undefined>;
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
): UseChartJsReturn<TType, TData, TLabel> {
	const { modules = [], plugins = [], manual = false } = config ?? {};

	let _chart: Chart<TType, TData, TLabel>;

	const chart = ref<Chart<TType, TData, TLabel>>();
	const canvasRef = ref<HTMLCanvasElement | null>(null);
	const containerRef = ref<HTMLDivElement | null>(null);
	const containerSize = useElementBounding(containerRef);

	const syncPlugins = plugins.filter((plugin) => typeof plugin !== "function");
	const asyncPlugins = plugins.filter((plugin) => typeof plugin === "function");

	function init() {
		if (!canvasRef.value) {
			throw new Error(`Canvas not found`);
		}

		_chart?.destroy();
		_chart = new Chart(canvasRef.value, {
			type,
			data: data(_chart),
			options: toValue(chartOptions),
			plugins: syncPlugins,
		});

		_chart.data = data(_chart);
		_chart.update();
		chart.value = _chart;
	}

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

	if (!manual) {
		whenever(canvasRef, init);
	}

	registerModules(modules);
	registerAsyncPlugins(asyncPlugins).then(() => _chart?.update());

	return {
		init,
		canvasRef,
		containerRef,
		chart,
	};
}

function registerModules(modules: ChartComponentLike[]) {
	Chart.register(...modules);
}

function registerAsyncPlugins<TType extends ChartType = ChartType>(plugins: AsyncPlugin<TType>[]) {
	return Promise.all(plugins.map((plugin) => plugin())).then((resolvedAsyncPlugins) => {
		const pluginDefaults = resolvedAsyncPlugins.map((plugin) => plugin.default);
		Chart.register(...pluginDefaults);
	});
}
