import { extent } from "d3-array";
import { nest } from "d3-collection";
import { event, select, selectAll } from "d3-selection";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { schemePaired } from "d3-scale-chromatic";
import { hierarchy, treemap, treemapResquarify } from "d3-hierarchy";
import { svg, TMargin } from "@buckneri/spline";

export type TTreeSeries = {
  category?: string,
  color?: string,
  label: string,
  value: number
};

export type TTree = {
  series: TTreeSeries[]
};

export type TTreechartOptions = {
  container: HTMLElement,
  data: TTree,
  formatValue?: Intl.NumberFormat,
  locale?: string,
  margin: TMargin
};

export class Treechart {
  public container: HTMLElement = document.querySelector("body") as HTMLElement;
  public formatValue: Intl.NumberFormat;
  public h: number = 200;
  public locale: string = "en-GB";
  public margin: TMargin = { bottom: 20, left: 20, right: 20, top: 20 };
  public rh: number = 160;
  public rw: number = 150;
  public w: number = 200;

  private _canvas: any;
  private _color = scaleOrdinal(schemePaired);
  private _data: TTree = { series: [] };
  private _extent: [number, number] = [0, 0];
  private _id: string = "";
  private _opacity: any;
  private _root: any;
  private _selected: SVGElement | undefined;
  private _svg: any;

  constructor(options: TTreechartOptions) {
    if (options.margin !== undefined) {
      let m = options.margin;
      m.left = isNaN(m.left) ? 0 : m.left;
      m.right = isNaN(m.right) ? 0 : m.right;
      m.top = isNaN(m.top) ? 0 : m.top;
      m.bottom = isNaN(m.bottom) ? 0 : m.bottom;
      this.margin = m;
    }

    if (options.locale !== undefined) {
      this.locale = options.locale;
    }

    if (options.formatValue !== undefined) {
      this.formatValue = options.formatValue;
    } else {
      this.formatValue = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 2, style: "decimal" });
    }

    if (options.container !== undefined) {
      this.container = options.container;
    }

    const box: DOMRect = this.container.getBoundingClientRect();
    this.h = box.height;
    this.w = box.width;
    this.rh = this.h - this.margin.top - this.margin.bottom;
    this.rw = this.w - this.margin.left - this.margin.right;
    
    this.data(options.data);
  }

  /**
   * Clears selection from Treechart
   */
  public clearSelection(): Treechart {
    selectAll(".selected").classed("selected", false);
    selectAll(".fade").classed("fade", false);
    this._selected = undefined;
    return this;
  }

  /**
   * Saves data into Treechart
   * @param data - Treechart data
   */
  public data(data: any): Treechart {
    this._data = data;
    this._data.series.forEach((item: TTreeSeries) => {
      item.color = this._color(item.category ? item.category : item.label);
    });

    const dataNested = { name: "root", children: this._nest(this._data.series, (d: any) => d.category, (d: any) => d.label) };

    const h = hierarchy(dataNested).sum((d: any) => d.value).sort((a: any, b: any) => b.value - a.value);

    const tree = (d: any) => treemap()
      .tile(treemapResquarify)
      .size([this.rw, this.rh])
      .padding(1)
      .round(true)(h);

    this._root = tree(dataNested);
  
    this._scalingExtent();

    this._opacity = scaleLinear().domain(this._extent).range([0.5, 0.9]);

    return this;
  }

  /**
   * Removes this chart from the DOM
   */
  public destroy(): Treechart {
    select(this.container).select("svg").remove();
    return this;
  }

  /**
   * draws the Treechart
   */
  public draw(): Treechart {
    this._drawCanvas()
        ._drawSeries();
    
    return this;
  }

  /**
   * Serialise the Treechart data
   */
  public toString(): string {
    let dt: string = this._data.series.map((n: any) => `${n}`).join("\n");
    return `data:\n${dt}`;
  }

  // ***** PRIVATE METHODS

  private _drawCanvas(): Treechart {
    if (select(this.container).select("svg.treechart").empty()) {
      this._id = "treechart" + Array.from(document.querySelectorAll(".treechart")).length;
      let sg: SVGElement | null = svg(this.container, {
        class: "treechart",
        height: this.h,
        id: this._id,
        margin: this.margin,
        width: this.w
      }) as SVGElement;
      this._svg = select(sg)
        .on("click", () => this.clearSelection());
      this._canvas = this._svg.select(".canvas");
    }

    return this;
  }

  private _drawSeries(): Treechart {
    let g = this._canvas.select("g.series");
    if (g.empty()) {
      g = this._canvas.append("g").attr("class", "series");
    }
    
    g.selectAll("g.box")
      .data(this._root.leaves())
      .join(
        (enter: any) => {
          const leaf = enter.append("g")
            .attr("class", "box")
            .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

          leaf.append("title")
            .text((d: any) => `${d.data.category} -> ${d.data.label} \n${this.formatValue.format(d.value)}`);

          leaf.append("rect")
            .attr("id", (d: any, i: number) => `${this._id}_p${i}`)
            .attr("class", "box")
            .attr("fill", (d: any) => d.data.color)
            .attr("fill-opacity", (d: any) => this._opacity(d.data.value))
            .attr("width", (d: any) => d.x1 - d.x0)
            .attr("height", (d: any) => d.y1 - d.y0)
            .on("click", (d: any, i: number, nodes: Node[]) => this._seriesClickHandler(nodes[i] as Element));

          leaf.append("clipPath")
            .attr("id", (d: any, i: number) => `${this._id}_clip${i}`)
            .append("rect")
              .attr("x", 0).attr("y", 0)
              .attr("width", (d: any) => d.x1 - d.x0)
              .attr("height", (d: any) => d.y1 - d.y0);

          leaf.append("text")
            .attr("class", "box")
            .attr("font-size", "smaller")
            .attr("clip-path", (d: any, i: number) => `url(#${this._id}_clip${i})`)
            .selectAll("tspan")
            .data((d: any) => d.data.label.split(/(?=[A-Z][a-z])|\s+/g).concat(this.formatValue.format(d.value)))
            .join("tspan")
              .attr("x", 3)
              .attr("y", (d: any, i: number, nodes: Node[]) => `${(i === nodes.length - 1 ? 1 : 0) * 0.3 + 1.1 + i * 0.9}em`)
              .attr("fill-opacity", (d: any, i: number, nodes: any[]) => i === nodes.length - 1 ? 0.7 : null)
              .text((d: any) => d);
        },
        (update: any) => {
          update.attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);
        },
        (exit: any) => exit.remove()
      );

    return this;
  }

  private _nest(data: any, ...keys: any): any {
    const n = nest();
    for (const key of keys) {
      n.key(key);
    }
    function hierarchy({key, values}: any, depth: any) {
      return {
        name: key,
        children: depth < keys.length - 1
            ? values.map((d: any) => hierarchy(d, depth + 1)) 
            : values
      };
    }
    return n.entries(data).map(d => hierarchy(d, 0));
  }

  private _seriesClickHandler(el: Element): void {
    event.stopPropagation();
    const exit = el === this._selected ? true : false;
    this.clearSelection();
    if (exit) {
      return;
    }
    window.dispatchEvent(new CustomEvent("tree-selected", { detail: el }));
    selectAll("rect.box")
      .each((d: any, i: number, n: any) => {
        if (n[i] === el) {
          select(el).classed("selected", true);
          this._selected = n[i];
        } else {
          select(n[i]).classed("fade", true);
        }
      });
  }

  /**
   * Determines the minimum and maximum extent values used by scale
   */
  private _scalingExtent(): Treechart {
    this._extent = extent(this._data.series, (d: TTreeSeries) => d.value) as [number, number];
    return this;
  }
}