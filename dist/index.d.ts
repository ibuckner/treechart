import { Basechart, TMargin } from "@buckneri/spline";
export declare type TTreeSeries = {
    category?: string;
    color?: string;
    label: string;
    value: number;
};
export declare type TTree = {
    series: TTreeSeries[];
};
export declare type TTreechartOptions = {
    container: HTMLElement;
    data: TTree;
    formatValue?: Intl.NumberFormat;
    locale?: string;
    margin: TMargin;
};
export declare class Treechart extends Basechart {
    formatValue: Intl.NumberFormat;
    private _data;
    private _extent;
    private _opacity;
    private _root;
    private _svg;
    constructor(options: TTreechartOptions);
    /**
     * Saves data into Treechart
     * @param data - Treechart data
     */
    data(data: any): Treechart;
    /**
     * draws the Treechart
     */
    draw(): Treechart;
    /**
     * Serialise the Treechart data
     */
    toString(): string;
    private _drawCanvas;
    private _drawSeries;
    private _nest;
    private _seriesClickHandler;
    /**
     * Determines the minimum and maximum extent values used by scale
     */
    private _scalingExtent;
}
