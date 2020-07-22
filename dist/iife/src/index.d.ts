import { TMargin } from "@buckneri/spline";
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
export declare class Treechart {
    container: HTMLElement;
    formatValue: Intl.NumberFormat;
    h: number;
    locale: string;
    margin: TMargin;
    rh: number;
    rw: number;
    w: number;
    private _canvas;
    private _color;
    private _data;
    private _extent;
    private _id;
    private _opacity;
    private _root;
    private _selected;
    private _svg;
    constructor(options: TTreechartOptions);
    /**
     * Clears selection from Treechart
     */
    clearSelection(): Treechart;
    /**
     * Saves data into Treechart
     * @param data - Treechart data
     */
    data(data: any): Treechart;
    /**
     * Removes this chart from the DOM
     */
    destroy(): Treechart;
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
