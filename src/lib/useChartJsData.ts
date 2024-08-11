import { ChartData, ChartType, DefaultDataPoint, Chart } from "chart.js";

export function useChartJsData<
	TType extends ChartType = ChartType,
	TData = DefaultDataPoint<TType>,
	TLabel = unknown,
	TChartType = Chart<TType, TData, TLabel> | undefined,
>(data: (chart: TChartType) => ChartData<TType, TData, TLabel>) {
	return (chart: TChartType) => data(chart);
}
