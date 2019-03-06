
// citation for building the graph:  https://www.d3-graph-gallery.com/graph/connectedscatter_legend.html

document.addEventListener('DOMContentLoaded', () => {
  // this uses a structure called a promise to asyncronously get the data set

  // use Promise.all to load in more than one dataset
  Promise.all([
      './data/high_income_matmort.json',
      './data/low_income_matmort.json',
      './data/lower_mid_income_matmort.json',
      './data/upper_mid_income_matmort.json'
    ].map(url => fetch(url).then(data => data.json())))
      .then(data => myVis(data))
    .catch(function(error){
        console.log(`An unexpected error occured: ${error}`);
    });
});


function myVis(data) {
  const [high_inc_matmort, low_inc_matmort,
         lowermid_inc_matmort, uppermid_inc_matmort] = data;
  console.log(high_inc_matmort);


  // set the dimensions and margins of the graph
  var margin = {top: 50, right: 50, bottom: 50, left: 50},
      width = 900 - margin.left - margin.right,
      height = 900 - margin.top - margin.bottom;


  // append the svg object to the body of the page
  var svg = d3.select(".my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");



  // Step 1  (https://bl.ocks.org/syntagmatic/8ab9dc27f144683bc015eb4a2639d234)
  console.log('prep data');
  console.log('step 1');
  const dataReady2 = d3.nest()
    .key(function(d) { return d.year; })
    // .rollup(function(v) { return d3.sum(v, function(d) { return d.rank; }); })
    .object(high_inc_matmort);
  // console.log(JSON.stringify(dataNest1));
  console.log(dataReady2);

  // Step 2  (https://bl.ocks.org/syntagmatic/8ab9dc27f144683bc015eb4a2639d234)
  console.log('step 2');
  const dataReady3 = d3.nest()
    .key(function(d) { return d.year; })
    .key(function(d) { return d.iso; })
    .rollup(function(v) { return d3.sum(v, function(d) { return d.rank; }); })
    .object(high_inc_matmort);
  // console.log(JSON.stringify(dataNest1));
  console.log(dataReady3);

  // Step X  (https://bl.ocks.org/syntagmatic/8ab9dc27f144683bc015eb4a2639d234)
  console.log('step x');
  const dataReadyx = d3.nest()
    .key(function(d) { return d.iso; })
    .key(function(d) { return d.year; })
    .rollup(function(v) { return d3.sum(v, function(d) { return d.rank; }); })
    .object(high_inc_matmort);
  // console.log(JSON.stringify(dataNest1));
  const updatedData = Object.entries(dataReadyx).map(([countryCode, yearDict]) => {
    return {
      iso: countryCode,
      values: Object.entries(yearDict).map(([year, rank]) => {
        return {year, rank};
      })
    };
  });
  console.log(updatedData);


  var dataReady = [
    {"iso": "USA",
    "values":[
      {"year":1, "rank":2},
      {"year":5, "rank":10},
      {"year":7, "rank":12}]},
    {"iso": "POL",
    "values":[
      {"year":3, "rank":2},
      {"year":5, "rank":17},
      {"year":9, "rank":12}]},
    {"iso": "GRC",
    "values":[
      {"year":1, "rank":8},
      {"year":4, "rank":8},
      {"year":7, "rank":2}]},
    {"iso": "FRA",
    "values":[
      {"year":5, "rank":2},
      {"year":7, "rank":10},
      {"year":10, "rank":12}]
    }];

  // Add X axis, but make invisible;
  // maybe uswe scaleband
  var x = d3.scaleLinear()
    .domain([0, 10])
    .range([ margin.left, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")");
    // .call(d3.axisBottom(x));

  // Add Y axis, but make invisible;
  var y = d3.scaleLinear()
    .domain( [0,20])
    .range([ height, margin.top ]);
  svg.append("g");
    // .call(d3.axisLeft(y));

  // Add the lines
  var line = d3.line()
    .x(function(d) { return x(+d.year) })
    .y(function(d) { return y(+d.rank) });


    // myLines should be a real selector, eg .country-line
  svg.selectAll("myLines")
    .data(dataReady)
    .enter()
    .append("path")
      .attr("class", function(d){ return `country-line ${d.iso}` })
      .attr("d", function(d){ return line(d.values) } )
      .style("stroke-width", 4)
      .style("stroke", "black")
      .attr("fill", "none");


  // Add the points
  svg
    // First we need to enter in a group
    .selectAll("myDots")
    .data(dataReady)
    .enter()
      .append('g')
      .attr("class", function(d){ return d.iso })
    // Second we need to enter in the 'values' part of this group
    .selectAll("myPoints")
    .data(function(d){ return d.values })
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.year) - 20 / 2} )
      .attr("y", function(d) { return y(d.rank) - 20 / 2} )
      .attr("width", 20)
      .attr("height", 20)
      .attr("stroke", "white")

    // .append("circle")
    //   .attr("cx", function(d) { return x(d.year) } )
    //   .attr("cy", function(d) { return y(d.rank) } )
    //   .attr("r", 5)
    //   .attr("stroke", "white")


  // Add a label at the beginning of each line
  svg
    .selectAll("myLabels1")
    .data(dataReady)
    .enter()
      .append('g')
      .append("text")
        .attr("class", function(d){ return d.iso })
        .datum(function(d) { return {iso: d.iso, value: d.values[0]}; }) // keep only the last value of each time sery
        .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.rank) + ")"; }) // Put the text at the position of the last point
        .attr("x", -60) // shift the text a bit more right
        .text(function(d) { return d.iso; })
        .style("font-size", 15)

  // Add a label at the end of each line
  svg
    .selectAll("myLabels2")
    .data(dataReady)
    .enter()
      .append('g')
      .append("text")
        .attr("class", function(d){ return d.iso })
        .datum(function(d) { return {iso: d.iso, value: d.values[d.values.length - 1]}; }) // keep only the last value of each time sery
        .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.rank) + ")"; }) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right
        .text(function(d) { return d.iso; })
        .style("font-size", 15)

  // Add a legend (interactive)
  svg
    .selectAll("myLegend")
    .data(dataReady)
    .enter()
      .append('g')
      .append("text")
        .attr('x', function(d,i){ return 30 + i*60})
        .attr('y', 30)
        .text(function(d) { return d.iso; })
        .style("font-size", 15)
      .on("click", function(d){
        // is the element currently visible ?
        currentOpacity = d3.selectAll("." + d.iso).style("opacity")
        // Change the opacity: from 0 to 1 or from 1 to 0
        d3.selectAll("." + d.iso).transition().style("opacity", currentOpacity == 1 ? 0:1)

      })


};
