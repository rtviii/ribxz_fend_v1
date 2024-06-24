import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Sample data (replace with your actual data)
const data = [

  { year: 2000, EM: 5, XRAY: 20 },
  { year: 2001, EM: 8, XRAY: 25 },
  { year: 2002, EM: 8, XRAY: 25 },
  { year: 2003, EM: 8, XRAY: 25 },
  { year: 2004, EM: 8, XRAY: 25 },
  { year: 2005, EM: 8, XRAY: 25 },
  { year: 2006, EM: 8, XRAY: 25 },
  { year: 2007, EM: 8, XRAY: 25 },
  { year: 2008, EM: 8, XRAY: 25 },
  { year: 2009, EM: 8, XRAY: 25 },
  { year: 2010, EM: 8, XRAY: 25 },
  { year: 2011, EM: 8, XRAY: 25 },
  { year: 2012, EM: 8, XRAY: 25 },
  { year: 2013, EM: 8, XRAY: 25 },
  { year: 2014, EM: 8, XRAY: 25 },
  { year: 2015, EM: 150, XRAY: 100 },
  { year: 2016, EM: 150, XRAY: 100 },
  { year: 2017, EM: 150, XRAY: 100 },
  { year: 2018, EM: 150, XRAY: 100 },
  { year: 2019, EM: 150, XRAY: 100 },
  { year: 2020, EM: 150, XRAY: 100 },
  { year: 2021, EM: 150, XRAY: 100 },
  { year: 2022, EM: 150, XRAY: 100 },
  { year: 2023, EM: 150, XRAY: 100 },
  { year: 2024, EM: 160, XRAY: 90 },
];

interface StackedBarChartProps {
  onBarClick: (year: number, type: string, value: number) => void;
  onBarHover: (year: number, type: string, value: number) => void;
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ onBarClick, onBarHover }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const stack = d3.stack()
      .keys(['EM', 'XRAY'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(data);

    const x = d3.scaleBand()
      .domain(data.map(d => d.year.toString()))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1])) || 0])
      .range([height, 0]);

    // const color = d3.scaleOrdinal()
    //   .domain(['EM', 'XRAY'])
    //   .range(['black', 'white']);

    svg.selectAll('g')
      .data(series)
      .enter().append('g')
        .attr('fill', d => { console.log(d);
            return d.key == "XRAY" ? "white" : "blac"
        })
        .attr('stroke', d => { console.log(d);
            return d.key == "XRAY" ? "black" : "black"
        })
      .selectAll('rect')
      .data(d => d)
      .enter().append('rect')
        .attr('x', d => x(d.data.year.toString()) || 0)
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth()-4)

        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget).attr('opacity', 0.8);
          onBarHover(d.data.year, d3.select(event.currentTarget.parentNode).datum().key, d[1] - d[0]);
        })
        .on('mouseout', (event) => {
          d3.select(event.currentTarget).attr('opacity', 1);
        })
        .on('click', (event, d) => {
          onBarClick(d.data.year, d3.select(event.currentTarget.parentNode).datum().key, d[1] - d[0]);
        });

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 5 === 0)));

    svg.append('g')
      .call(d3.axisLeft(y));

    // Add legend
    const legend = svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(['EM', 'XRAY'])
      .enter().append('g')
        .attr('transform', (d, i) => `translate(0,${i * 20})`);

    legend.append('rect')
      .attr('x', width - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', d=>{return "blue"});



    legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(d => d);

  }, [dimensions, onBarClick, onBarHover]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
     </div>
  );
};

// Usage in your main component
const MainComponent = () => {
  const handleBarClick = (year: number, type: string, value: number) => {
    console.log(`Clicked: ${year}, ${type}, ${value}`);
    // Add your click logic here
  };

  const handleBarHover = (year: number, type: string, value: number) => {
    console.log(`Hovered: ${year}, ${type}, ${value}`);
    // Add your hover logic here
  };

  return (
    // <div className="w-full  rounded-md relative border-gray-400 hover:shadow-lg transition-all">
    //   <h3 className="text-lg font-semibold mb-2">Depositions by Year</h3>
      <div className="h-48"> {/* Adjust height as needed */}
        <StackedBarChart onBarClick={handleBarClick} onBarHover={handleBarHover} />
      </div>
    // </div>
  );
};

export default MainComponent;