
// Citation for building the bumpchart:  https://www.d3-graph-gallery.com/graph/connectedscatter_legend.html
// Citation for building focus:  https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3
// Citation for dropdown menue:  https://bl.ocks.org/ProQuestionAsker/b8f8c2ab12c4f21e882aeb68728216c2

document.addEventListener('DOMContentLoaded', () => {
  // this uses a structure called a promise to asyncronously get the data set

  // use Promise.all to load in more than one dataset
  Promise.all([
      './data/high_income.json',
      './data/upper_mid_income.json',
      './data/lower_mid_income.json',
      './data/low_income.json'
    ].map(url => fetch(url).then(data => data.json())))
      .then(data => myVis(data))
    .catch(function(error){
        console.log(`An unexpected error occured: ${error}`,error);
    });
});


function myVis(data) {

  var [high_income, upper_mid_income, lower_mid_income, low_income] = data;


  // //button
  // d3.select("#button_high_income")
  //   .on("click", function(d,i){
  //     generate_bumpchart(high_income)});
  //
  // d3.select("#button_low_income")
  //   .on("click", function(d,i){
  //     generate_bumpchart(low_income)});

  // Create dropdown and dictionary
  var dropdownDict = [{"income_level": "High income countries", "dataset": high_income},
                      {"income_level": "Upper middle income countries", "dataset": upper_mid_income},
                      {"income_level": "Lower middle income countries", "dataset": lower_mid_income},
                      {"income_level": "Low income countries", "dataset": low_income}
                    ];


  console.log(dropdownDict);

  // create the dropdown menu
  var dropdownMenu = d3.select("#dropdownMenu")

  dropdownMenu
        .append("select")
        .selectAll("option")
        .data(dropdownDict)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.income_level;
        })
        .text(function(d){
            return d.income_level;
        });

  dropdownMenu
        .on('change', function(){
        // Find which fruit was selected from the dropdown
        var selected_income = d3.select(this)
        .select("select")
        .property("value")

        console.log(selected_income)
        // generate_bumpchart(selected_income)
        // where income_level == selected_income
        // dropdownDict.dataset ==

        });

  // Create the initial graph
  generate_bumpchart(high_income)

  // Format data (citation:  https://bl.ocks.org/syntagmatic/8ab9dc27f144683bc015eb4a2639d234)
  function generate_bumpchart(selected_data){

        console.log(high_income);
        // set the dimensions and margins of the graph
        var margin = {top: 50, right: 50, bottom: 50, left: 50},
            width = 900 - margin.left - margin.right,
            height = 900 - margin.top - margin.bottom;

        // Create the svg object and append to the body of the page
        // var svg = d3.select(".my_dataviz")
        var svg = d3.select(".bumpchart_svg")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform","translate(" + margin.left + "," + margin.top + ")");
        //format the data
        var dataReadyx = d3.nest()
          .key(function(d) { return d.iso; })
          .key(function(d) { return d.year; })
          .rollup(function(v) { return d3.sum(v, function(d) { return d.rank; }); })
          .object(selected_data);
        var dataReady = Object.entries(dataReadyx).map(([countryCode, yearDict]) => {
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


        // x-axis
        var x = d3.scaleBand()
          .domain([1985, 1990, 1995, 2000, 2005, 2010, 2015])
          .range([ margin.left, width ]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // y-axis
        var size = Object.keys(dataReady).length; // Y-axis as large as selection
        var y = d3.scaleLinear()
          .domain( [1, size])
          .range([ margin.top, height ]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // create line generator
        var lineGenerator = d3.line().curve(d3.curveMonotoneX) // D3 Curve Explorer:  http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
            .x( d => x(+d.year) )
            .y( d => y(+d.rank) );

        // isoCodes = [];
        // dataReady.forEach(function(d, i) {
        //   isoCodes[i] = d.values[0].rank % 8;
        // });
        // console.log("ISO CODES");
        // console.log(isoCodes);


        var color = ['#13394A', //dark blue
                '#E3DD44', //yellow
                '#357797', //mid blue
                '#D4626F', //salmon
                '#948E00', //green
                '#CC149B', //fuschia
                '#7102FA', //purple
                '#E48023' //orange
              ];

        // generate lines
        svg
          .selectAll(".country-line")
          .data(dataReady)
          .enter()
          .append("path")
            .attr("class", d => `country-line ${d.iso}` )
            .attr("d", d => lineGenerator(d.values) )
            .attr("stroke-width", 3)
            .attr("stroke", function(d, i) { return color[i % 8];})
            .attr("fill", "none")

        // Add the points
        svg
          // First we need to enter in a group
          .selectAll(".eachCountry")
          .data(dataReady)
          .enter()
            .append('g')
            .attr("class", function(d){ return d.iso })
          // Second we need to enter in the 'values' part of this group
          .selectAll(".point-rect")
          .data( d => d.values)
          .enter()
          .append("circle")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.rank))
            .attr("r", 1)
            .attr("stroke", "white")
            .attr("fill", "none")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mousemove", function(d) {
              var xPosition = d3.mouse(this)[0];
              var yPosition = d3.mouse(this)[1];

              focus.attr("transform","translate(" + xPosition + "," + yPosition + ")")

              focus.select("text")
                    .text("rank: " + d.rank + " year: " + d.year)
                    .attr("fill", "black")
            });

      //the focus tooltip (also part of the point generator)
        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 5)
            .attr("fill", "#F4F4F4")
            .attr("stroke-width", "4px")
            .attr("stroke", function(d, i) { return color[i % 8];});

        focus.append("text")
          .attr("x", 15)
        	.attr("dy", ".31em");

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
              .attr("x", -30) // shift the text a bit more right
              .text(function(d) { return d.iso; })
              .attr("font-size", 10)
              .attr("stroke", function(d, i) { return color[i % 8];})

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
              .attr("font-size", 10)
              .attr("stroke", function(d, i) { return color[i % 8];})

      };



    // Update the data
   	var updateGraph = function(dataset){

 		// Filter the data to include only fruit of interest
 		var selectFruit = dataReady.filter(function(d){
                return d.key == dataset;
              })

 		// Select all of the grouped elements and update the data
	    var selectFruitGroups = svg.selectAll(".fruitGroups")
		    .data(selectFruit)
		    .each(function(d){
                y.domain([0, d.value.max])
            });

		    // Select all the lines and transition to new positions
            selectFruitGroups.selectAll("path.line")
               .data(function(d) { return d.value.year; },
               		function(d){ return d.key; })
               .transition()
                  .duration(1000)
                  .attr("d", function(d){
                    return valueLine(d.values)
                  })

        // Update the Y-axis
            d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5)
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));


 	}

};
