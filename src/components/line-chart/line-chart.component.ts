import { ChangeDetectionStrategy, Component, ElementRef, input, viewChild, afterNextRender, OnDestroy } from '@angular/core';

// Declare the d3 object to inform TypeScript that it's available globally
declare var d3: any;

interface ChartData {
  date: Date;
  value: number;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: `<div #chartContainer class="w-full h-full"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements OnDestroy {
  data = input.required<{ date: Date; value: number }[]>();
  chartContainer = viewChild<ElementRef>('chartContainer');
  
  private svg: any;

  constructor() {
    afterNextRender(() => {
      if (this.data().length > 1) {
        this.createChart(this.data());
      }
    });
  }
  
  ngOnDestroy(): void {
    // Clean up D3 elements to prevent memory leaks
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }

  private createChart(data: ChartData[]): void {
    const element = this.chartContainer()?.nativeElement;
    if (!element) return;
    
    // Clear previous chart
    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;

    this.svg = d3.select(element)
      .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${element.clientWidth} ${element.clientHeight}`)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // --- Scales ---
    const x = d3.scaleTime()
      .domain(d3.extent(data, (d: ChartData) => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: ChartData) => d.value) * 1.1]) // Add 10% padding to top
      .range([height, 0]);
      
    // --- Axes ---
    this.svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%m/%Y')))
      .selectAll('text')
        .style('font-size', '12px');

    this.svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d: number) => `${(d / 1000000).toFixed(0)}tr`))
      .selectAll('text')
        .style('font-size', '12px');
        
    // --- Gradient for Area ---
    const defs = this.svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', y(0))
      .attr('x2', 0).attr('y2', y(d3.max(data, (d: ChartData) => d.value)));
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#facc15').attr('stop-opacity', 0);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#facc15').attr('stop-opacity', 0.4);

    // --- Area ---
    this.svg.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('stroke', 'none')
      .attr('d', d3.area()
        .x((d: any) => x(d.date))
        .y0(height)
        .y1((d: any) => y(d.value))
        .curve(d3.curveMonotoneX)
      );

    // --- Line ---
    this.svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ca8a04')
      .attr('stroke-width', 2.5)
      .attr('d', d3.line()
        .x((d: any) => x(d.date))
        .y((d: any) => y(d.value))
        .curve(d3.curveMonotoneX)
      );
      
    // --- Tooltip ---
    const tooltip = d3.select(element).append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid #ccc')
        .style('border-radius', '5px')
        .style('padding', '10px')
        .style('opacity', 0)
        .style('pointer-events', 'none');
        
    const focus = this.svg.append('g').style('display', 'none');
    focus.append('line').attr('class', 'x-hover-line hover-line').attr('y1', 0).attr('y2', height).style('stroke', '#999').style('stroke-dasharray', '3,3');
    focus.append('circle').attr('r', 7.5).style('fill', '#ca8a04').style('stroke', 'white').style('stroke-width', '2px');

    this.svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseover', () => { focus.style('display', null); tooltip.style('opacity', .9); })
        .on('mouseout', () => { focus.style('display', 'none'); tooltip.style('opacity', 0); })
        .on('mousemove', (event: any) => {
            const bisectDate = d3.bisector((d: ChartData) => d.date).left;
            const x0 = x.invert(d3.pointer(event)[0]);
            const i = bisectDate(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            // FIX: Use .getTime() for date arithmetic to avoid TypeScript errors.
            const d = d1 && (x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime()) ? d1 : d0;
            
            focus.attr('transform', `translate(${x(d.date)},${y(d.value)})`);
            focus.select('.x-hover-line').attr('y2', height - y(d.value));

            tooltip.html(
                `<strong>Tháng ${d.date.getMonth() + 1}/${d.date.getFullYear()}</strong><br/>` +
                `Giá TB: <strong>${(d.value / 1000000).toFixed(2)} tr/m²</strong>`
            )
            .style('left', (x(d.date) + margin.left + 15) + 'px')
            .style('top', (y(d.value) + margin.top - 28) + 'px');
        });
  }
}