import * as d3 from 'd3';

// Define the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
const svg = d3.select("#stacked-barplot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Generate random data
const data = d3.range(2000, 2025).map(year => {
    return {
        year: year,
        blue: Math.random() * 200,
        black: Math.random() * 200
    };
});

// List of subgroups
const subgroups = ["blue", "black"];

// List of years
const years = data.map(d => d.year);

// Add X axis
const x = d3.scaleLinear()
    .domain([0, 400]) // The range of the values in the x-axis
    .range([0, width]);
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

// Add Y axis
const y = d3.scaleBand()
    .domain(years)
    .range([0, height])
    .padding(0.1);
svg.append("g")
    .call(d3.axisLeft(y));

// Color palette
const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(["blue", "black"]);

// Stack the data
const stackedData = d3.stack()
    .keys(subgroups)
    (data);

// Show the bars
svg.append("g")
    .selectAll("g")
    .data(stackedData)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("y", d => y(d.data.year)!)
    .attr("x", d => x(d[0]))
    .attr("width", d => x(d[1]) - x(d[0]))
    .attr("height", y.bandwidth());
