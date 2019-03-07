
// Citation for building the graph:  https://www.d3-graph-gallery.com/graph/connectedscatter_legend.html

document.addEventListener('DOMContentLoaded', () => {
  // this uses a structure called a promise to asyncronously get the data set

  // use Promise.all to load in more than one dataset
  Promise.all([
      './data/high_income.json',
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
  const [high_income, high_inc_matmort, low_inc_matmort,
         lowermid_inc_matmort, uppermid_inc_matmort] = data;

  console.log(high_income);
  // set the dimensions and margins of the graph
  var margin = {top: 50, right: 50, bottom: 50, left: 50},
      width = 900 - margin.left - margin.right,
      height = 1500 - margin.top - margin.bottom;



  // append the svg object to the body of the page
  var svg = d3.select(".my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // const data1 = d3.nest()
  //   .key( d => d.iso)
  //   .key( d => d.year)
  //   .rollup(function(v) { return d3.sum(v, function(d) { return d.rank; }); })
  //   .rollup(function(v) { return d3.sum(v, function(d) { return d.name; }); })
  //   .object(high_income);
  // console.log('data1');
  // console.log(data1);
  // const data2 = Object.entries(data1).map(([countryCode, yearDict]) => {
  //   return {
  //     iso: countryCode,
  //     values: Object.entries(yearDict).map(([year, rank]) => {
  //       return {year, rank};
  //     })
  //   };
  // });
  // console.log('data2');
  // console.log(data2);

  // Step X  (https://bl.ocks.org/syntagmatic/8ab9dc27f144683bc015eb4a2639d234)
  const dataReadyx = d3.nest()
    .key(function(d) { return d.iso; })
    .key(function(d) { return d.year; })
    .rollup(function(v) { return d3.sum(v, function(d) { return d.rank; }); })
    .object(high_income);
  const dataReady = Object.entries(dataReadyx).map(([countryCode, yearDict]) => {
    return {
      iso: countryCode,
      values: Object.entries(yearDict).map(([year, rank]) => {
        return {year, rank};
      })
    };
  });
  console.log('dataReadyx');
  console.log(dataReadyx);
  console.log('dataReady');
  console.log(dataReady);




  // Add X axis, but make invisible;
  // maybe uswe scaleband
  var x = d3.scaleBand()
    .domain([1985, 1990, 1995, 2000, 2005, 2010, 2015])
    .range([ margin.left, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis, but make invisible;
  var size = Object.keys(dataReady).length; // Y-axis as large as selection

  var y = d3.scaleLinear()
    .domain( [1, size])
    .range([ margin.top, height ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // // Add the lines
  // var line = d3.line()
  //   .x(function(d) { return x(+d.year) })
  //   .y(function(d) { return y(+d.rank) });

  var lineGenerator = d3.line().curve(d3.curveMonotoneX) // D3 Curve Explorer:  http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
      .x( d => x(+d.year) )
      .y( d => y(+d.rank) );


    // myLines should be a real selector, eg .country-line
  svg.selectAll(".country-line")
    .data(dataReady)
    .enter()
    .append("path")
      .attr("class", d => `country-line ${d.iso}` )
      .attr("d", d => lineGenerator(d.values) )
      .style("stroke-width", 3)
      .style("stroke", "black")
      .attr("fill", "none");


  // Add the points
  svg
    // First we need to enter in a group
    .selectAll(".eachCountry")
    .data(dataReady)
    .enter()
      .append('g')
      .attr("class", function(d){ return d.iso })
    // // Second we need to enter in the 'values' part of this group
    // .selectAll(".point-rect")
    // .data( d => d.values)
    // // .data(function(d){ return d.values })
    // .enter()
    // .append("rect")
    //   .attr("x", d => x(d.year) - 20 / 2 )
    //   .attr("y", d => y(d.rank) - 20 / 2 )
    //   // .attr("x", function(d) { return x(d.year) - 20 / 2} )
    //   // .attr("y", function(d) { return y(d.rank) - 20 / 2} )
    //   .attr("width", 20)
    //   .attr("height", 20)
    //   .attr("stroke", "white")
    //   .attr("fill", "green")



  // Add a label at the beginning of each line
  svg
    .selectAll(".left-label")
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
    .selectAll(".right-label")
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
    .selectAll(".legend")
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
