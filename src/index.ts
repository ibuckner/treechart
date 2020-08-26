import { extent } from "d3-array";
import { nest } from "d3-collection";
import { select, selectAll } from "d3-selection";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { schemePaired } from "d3-scale-chromatic";
import { hierarchy, treemap, treemapResquarify } from "d3-hierarchy";
import { Basechart, svg, TMargin } from "@buckneri/spline";

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

export class Treechart extends Basechart {
  public formatValue: Intl.NumberFormat;

  private _data: TTree = { series: [] };
  private _extent: [number, number] = [0, 0];
  private _opacity: any;
  private _root: any;
  private _svg: any;

  constructor(options: TTreechartOptions) {
    super(options);

    if (options.formatValue !== undefined) {
      this.formatValue = options.formatValue;
    } else {
      this.formatValue = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 2, style: "decimal" });
    }

    this.data(options.data);
  }

  /**
   * Saves data into Treechart
   * @param data - Treechart data
   */
  public data(data: any): Treechart {
    this._data = data;
    this._data.series.forEach((item: TTreeSeries) => {
      item.color = this.scale.color(item.category ? item.category : item.label);
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
   * draws the Treechart
   */
  public draw(): Treechart {
    super.draw();

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
    this.id = "treechart" + Array.from(document.querySelectorAll(".treechart")).length;
    const svg = this.container.querySelector("svg");
    if (svg) {
      svg.classList.add("treechart");
      svg.id = this.id;
    }

    return this;
  }

  private _drawSeries(): Treechart {
    let g = this.canvas.select("g.series");
    if (g.empty()) {
      g = this.canvas.append("g").attr("class", "series");
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
            .attr("id", (d: any, i: number) => `${this.id}_p${i}`)
            .attr("class", "box")
            .attr("fill", (d: any) => d.data.color)
            .attr("fill-opacity", (d: any) => this._opacity(d.data.value))
            .attr("width", (d: any) => d.x1 - d.x0)
            .attr("height", (d: any) => d.y1 - d.y0)
            .on("click", (event: any) => this._seriesClickHandler(event));

          leaf.append("clipPath")
            .attr("id", (d: any, i: number) => `${this.id}_clip${i}`)
            .append("rect")
              .attr("x", 0).attr("y", 0)
              .attr("width", (d: any) => d.x1 - d.x0)
              .attr("height", (d: any) => d.y1 - d.y0);

          leaf.append("text")
            .attr("class", "box")
            .attr("font-size", "smaller")
            .attr("clip-path", (d: any, i: number) => `url(#${this.id}_clip${i})`)
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

  private _seriesClickHandler(event: any): void {
    event.stopPropagation();
    const el = event.target;
    const selected = this.canvas.select(".selected");

    const exit = el === selected.node() ? true : false;
    this.clearSelection();
    if (exit) {
      return;
    }
    window.dispatchEvent(new CustomEvent("tree-selected", { detail: el }));
    selectAll("rect.box")
      .each((d: any, i: number, n: any) => {
        if (n[i] === el) {
          select(el).classed("selected", true);
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