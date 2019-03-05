/* global d3 */

// this says that you want to wait until the page is loaded before you start to do stuff
document.addEventListener('DOMContentLoaded', () => {
  // this uses a structure called a promise to asyncronously get the cars data set
  fetch('./matmort_data.json')
    // this converts the returned readablestream into json, don't worry about it
    .then(data => data.json())
    // now that the data is actually understood as json we send it to your function
    .then(data => myVis(data))
});



function myVis(data) {
  console.log('hi!')
  // basic plot configurations, we'll use these
  const height = 600;
  const width = 600;
  const margin = {top: 50, left: 50, right: 50, bottom: 50};

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.bottom - margin.top;
  const colorRange = ['#12939A', '#79C7E3', '#1A3177', '#FF9833'];

  // EXERCISE 0 - CONVERT DATA INTO A USEABLE REPRESENTATION
  // we are going to be making a categorical bar chart with counts for each of the countries
  // so you need to iterate through the data (which you can look at it in the cars.json file)
  // and convert it into a representation like {'USA': 10, 'Europe': 20, etc}
  // then convert that (perhaps using Object.entries and a map) to a format like
  // [{country: 'USA', count: 10}, etc]
  const groups = data.reduce((acc, row) => {
    if (!acc[row.Origin]) {
      acc[row.Origin] = 0;
    }
    acc[row.Origin] += 1;
    return acc;
  }, {});
  const convertedData = Object.entries(groups).map(row => {
    return {country: row[0], count: row[1]};
  });


  // EXERCISE 1
  // create 3 scales, one mapping x, one mapping y, and one mapping color
  // (color should be an ordinal scale and x should be a band scale)
  // how do you figure out the yDomain ?
  const yDomain = convertedData.reduce((acc, row) => {
    return {
      min: Math.min(row.count, acc.min),
      max: Math.max(row.count, acc.max)
    };
  }, {min: Infinity, max: -Infinity});
  const countries = Object.keys(groups);
  const x = d3.scaleBand()
    .domain(countries)
    .range([margin.left, plotWidth])
    .padding(0.1);
  const y = d3.scaleLinear().domain([0, yDomain.max])
    .range([plotHeight, margin.top]);
  const color = d3.scaleOrdinal().domain(countries).range(colorRange);


  // CREATE A VARIABLE CALLED SVG THAT SELECTS .first ADDS AN SVG TO IT, AND
  // SETS HEIGHT AND WIDTH APPROPRIATELY
  const svg = d3.select('.first').append('svg')
    .attr('width', width).attr('height', height);

  // USE A SELECTALL AND DATA TO CREATE A JOIN CALLED rects
  // USE ENTER ON THAT, AND APPLY EACH OF THE PROPERTIES AS APPROPRIATE
  // (x, y, height, width, class, fill)

  // JOIN
  const rects = svg.selectAll('.rect').data(convertedData);
  // ENTER
  rects.enter()
    .append('rect')
    .attr('class', 'rect')
    .attr('height', d => y(0) - y(d.count))
    .attr('width', x.bandwidth())
    .attr('x', d => x(d.country))
    .attr('y', d => y(d.count))
    .attr('fill', d => color(d.country));


  // PART 2
  // Add Axes
  // I'll give you this one, but you need to figure out the other one!
  svg.append('g')
    .call(d3.axisBottom(x))
    .attr('transform', `translate(0, ${plotHeight})`);
  svg.append('g').call(d3.axisRight(y));

  // Next Add labels to each of the bars
  // this should be really similar to adding rects, but using text instead
  // note: text is a function like attr on text nodes
  // there are lots of svg text properties you can use to style your labels
  // try some out!
  const labels = svg.selectAll('.label').data(convertedData);
  // ENTER
  labels.enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.country) + x.bandwidth() / 2)
    .attr('y', d => y(d.count))
    .attr('text-anchor', 'middle')
    .attr('font-size', 28)
    .attr('font-family', 'sans-serif')
    .text(d => d.count);

  // Add A Title
  // (how can use the pattern we saw with labels to do this, perhaps make some artificial data)
  const title = svg.selectAll('.title').data([{x: 'Japan', y: 200, label: 'my chart!'}]);
  // ENTER
  title.enter()
    .append('text')
    .attr('class', 'title')
    .attr('x', d => x(d.x))
    .attr('y', d => y(d.y))
    .attr('text-anchor', 'middle')
    .attr('font-size', 42)
    .attr('font-family', 'sans-serif')
    .text(d => d.label);

}
