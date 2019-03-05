/* global d3 */

// // this says that you want to wait until the page is loaded before you start to do stuff
// document.addEventListener('DOMContentLoaded', () => {
//   // this uses a structure called a promise to asyncronously get the cars data set
//   fetch('./upper_matmort_data.json')
//     // this converts the returned readablestream into json, don't worry about it
//     .then(data => data.json())
//     // now that the data is actually understood as json we send it to your function
//     .then(data => myVis(data))
// });


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
  // console.log('HIGH INCOME');
  // console.log(high_inc_matmort);
  // console.log('LOW INCOME');
  // console.log(low_inc_matmort);
  // console.log('LOWER MID INCOME');
  // console.log(lowermid_inc_matmort);
  // console.log('UPPER MID INCOME');
  // console.log(uppermid_inc_matmort);



  const height = 800;
  const width = 800;
  const margin = {top: 50, right: 50, bottom: 50, left: 100};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.bottom - margin.top;


  // STEP 0 (http://learnjsdata.com/group_data.html)
  console.log('STEP 0')
  const dataNest0 = d3.nest()
    .key(function(d) { return d.year; })
    .entries(high_inc_matmort);
  // console.log(JSON.stringify(dataNest1));
  console.log(dataNest0);


  // STEP 1 (http://learnjsdata.com/group_data.html)
  console.log('STEP 1')
  const dataNest1 = d3.nest()
    .key(function(d) { return d.year; })
    .key(function(d) { return d.iso; })
    .rollup(function(v) { return d3.sum(v, function(d) { return d.rank; }); })
    .entries(high_inc_matmort);
  // console.log(JSON.stringify(dataNest1));
  console.log(dataNest1);

  // // Group by country.  All data showing.
  // console.log('Group by Country')
  // var dataNest2 = d3.nest()
  //                     .key(function(d) {return d.iso;})
  //                     .entries(high_inc_matmort);
  // console.log(dataNest2)


  // // STEP ??? (http://learnjsdata.com/group_data.html)
  // console.log('STEP 3')
  // var dataNest3 = d3.nest()
  //   .key(function(d) { return d.iso; })
  //   .rollup(function(v) { return d3.sum(v, function(d) { return d.rank; }); })
  //   .object(high_inc_matmort);
  // console.log(JSON.stringify(dataNest3));


  // Step 3  (https://bl.ocks.org/syntagmatic/8ab9dc27f144683bc015eb4a2639d234)
  console.log('STEP 3')
  window.byYear = {}
  d3.nest()
    .key(function(d) { return d.year; })
    .key(function(d) { return d.iso; })
    // .sortValues(function(a,b) { return a.value - b.value;  })
    // .rollup(function(leaves,i) {
    //   return leaves[0].value;
    // })
    .entries(high_inc_matmort)
    .forEach(function(year) {
      byYear[year.key] = {};
      year.values.forEach(function(iso,i) {
        byYear[year.key][iso.key] = i + 1;
      });
    });
  console.log(byYear)
  // console.log(JSON.stringify(byYear));




  // dataNest1.forEach(
  //   function(d) {dataNest1.key = {};
  //   key.values.forEach(function())
  //   }
  // )






  // const practiceline = d3.svg.line()
  //                               .x(function(d) { return x(d.year); })
  //                               .y(function(d) { return y(d.rank); });
  // dataNest.foreach(function(d) {
  //   svg.append("path")
  //       .attr("class", "line")
  //       .attr("d", practiceline(d.rank))
  // });



  // console.log("now here")
  // console.log(Year_by_Country_Ranking)
  //
  // const data_1985 = Year_by_Country_Ranking.filter(function (d) {return d.key === "2015"})
  // console.log(data_1985)



  var xScale = d3.scaleLinear()
                 .domain([1985, 2015])
                 .range([margin.left, plotWidth]);
  var yScale = d3.scaleLinear()
                 .domain([1, 52])
                 .range([margin.top, plotHeight]);
  var xAxis = d3.axisBottom()
                .scale(xScale)
                .tickValues([1985, 1990, 1995, 2000, 2005, 2010, 2015]);
  var yAxis = d3.axisLeft()
                .scale(yScale)
                .tickValues[1, 10, 20, 30, 40, 50];

  // var xScale = d3.scaleLinear()
  //                .domain([d3.extent(data, function(d) { return d.year; })])
  //                .range([0, plotWidth]);
  // var yScale = d3.scaleLinear()
  //                .domain([d3.min(data, function(d) { return Math.min(d.rank); }),
  //                         d3.max(data, function(d) { return Math.max(d.rank); })])
  //                .range([plotHeight, 0]);



  // Define line generator
  var line = d3.line()
      .x(function(d) { d => xScale(d[0]); })
      .y(function(d) { d => yScale(d[1]); });

  // create svg element
  var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

  // loop through countries ("iso") and create line
  byYear.forEach(function(d) {

    svg.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", line(d.values));
  });

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + (height-margin.bottom) + ")")
     .call(xAxis);

  svg.append("g")
     .attr("class", "axis")
     .call(yAxis);





  // var xAxis = d3.axisBottom()
  //         			.scale(xScale)
  //         			.tickValues([1985,1990,1995,2000,2005,2010,2015]);
  //
  // var yAxis = d3.axisLeft()
  //         			.scale(yScale)
  //         			.tickValues([1, 10, 20, 30, 40, 50]);

  // nest and roll up: year by country by rank (http://learnjsdata.com/group_data.html)


  // const svg = d3.select("body")
  //     						.append("svg")
  //     						.attr("width", width)
  //     						.attr("height", height);
  //
  // svg.append("g")
	// 		.attr("class", "axis x-axis")
	// 		.attr("transform", "translate(0," + plotHeight + ")")
	// 		.call(xAxis);
  //
	// svg.append("g")
	// 	.attr("class", "axis y-axis")
	// 	.attr("transform", "translate(" + margin.left + ",0)")
	// 	.call(yAxis));



}
