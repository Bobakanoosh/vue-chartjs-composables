import { type ChartOptions, type ChartType } from "chart.js";
import { toValue, type MaybeRefOrGetter } from "vue";

export function useChartJsOptions<TType extends ChartType = ChartType>(
	options: MaybeRefOrGetter<ChartOptions<TType>>,
) {
	return () => toValue(options);
}
