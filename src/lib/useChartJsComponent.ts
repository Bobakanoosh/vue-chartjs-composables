import { ChartType, DefaultDataPoint } from "chart.js";
import { UseChartJsReturn } from "./useChartJs";
import { Component, defineComponent, h } from "vue";

/** TODO: More accurate types */
export type UseChartJsComponentReturn = [Component, Component];

export function useChartJsComponent<
	TType extends ChartType = ChartType,
	TData = DefaultDataPoint<TType>,
	TLabel = unknown,
>(instance: UseChartJsReturn<TType, TData, TLabel>) {
	const { canvasRef, containerRef } = instance;
	const ChartCanvas = defineComponent({
		name: "ChartCanvas",
		setup() {
			return () => h("canvas", { ref: canvasRef });
		},
	});

	const ChartComponent = defineComponent({
		name: "ChartComponent",
		setup(props, { slots }) {
			return () => {
				return h(
					"div",
					{
						ref: containerRef,
						style: {
							position: "relative",
							width: "100%",
							height: "100%",
						},
					},
					[slots.default ? slots.default() : h(ChartCanvas)],
				);
			};
		},
	});

	return [ChartComponent, ChartCanvas];
}
