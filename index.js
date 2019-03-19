// Reference 1 (inspiration/citation for building the bumpchart):  https://www.d3-graph-gallery.com/graph/connectedscatter_legend.html
// Reference 2 (inspiration/citation for building focus):  https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3
// Reference 3 (inspiration/citation for dropdown menu):  https://bl.ocks.org/ProQuestionAsker/b8f8c2ab12c4f21e882aeb68728216c2
// Reference 4 (inspiration/citation for formatting data):  https://bl.ocks.org/syntagmatic/8ab9dc27f144683bc015eb4a2639d234
// Reference 5 (inspiration/citation for focus/tooltip):  https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3
// Reference 6 (inspiration/citation for indexing): https://stackoverflow.com/questions/37654345/returning-value-for-given-key-in-js-and-d3-do-i-have-to-loop

document.addEventListener('DOMContentLoaded', () => {
  // this uses a structure called a promise to asyncronously get the data set

  // use Promise.all to load in more than one dataset
  Promise.all([
      './data/high_income.json',
      './data/upper_mid_income.json',
      './data/lower_mid_income.json',
      './data/low_income.json',
      './data/Europe_and_Central_Asia.json',
      './data/NA_LAM_Caribbean.json',
      './data/Middle_East_and_North_Africa.json',
      './data/Sub_Saharan_Africa.json',
      './data/Asian_and_Pacific.json'
    ].map(url => fetch(url).then(data => data.json())))
      .then(data => myVis(data))
    .catch(function(error){
        console.log(`An unexpected error occured: ${error}`,error);
    });
});


function myVis(data) {
  var [high_income, upper_mid_income, lower_mid_income, low_income,
       europe_centralAsia, na_lam_carribean,
       middleEast_northAfrica, subsaharanAfrica, asian_pacific] = data;

  // set the dimensions and margins of the graph
  var margin = {top: 50, right: 200, bottom: 50, left: 120},
      width = 1700 - margin.left - margin.right,
      height = 1300 - margin.top - margin.bottom;


  // the focus/tooltip (see Reference 5)
  var focus = d3.select(".bumpchart_svg")
      .append('div')
      .attr('class', 'tooltip-container')
      .append("div")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("p");
    // .attr("x", 50)
  	// .attr("dy", ".31em");

  // Create the svg object and append to the body of the page
  var svg = d3.select(".bumpchart_svg")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  svg.append("text")
        .attr("class", "axes-labels")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Year");


  // Create dropdown and selection dictionary
  var dropdownDict = [{"selector_name": "High income countries", "dataset": high_income, "graph_title": "MMR Ranking of High Income Countries"},
                      {"selector_name": "Upper middle income countries", "dataset": upper_mid_income, "graph_title": "MMR Ranking of Upper Middle Income Countries"},
                      {"selector_name": "Lower middle income countries", "dataset": lower_mid_income, "graph_title": "MMR Ranking of Lower Middle Income Countries"},
                      {"selector_name": "Low income countries", "dataset": low_income, "graph_title": "MMR Ranking of Low Income Countries"},
                      {"selector_name": "European and Central Asian countries", "dataset": europe_centralAsia, "graph_title": "MMR Ranking of European and Central Asian Countries"},
                      {"selector_name": "American & Caribbean countries", "dataset": na_lam_carribean, "graph_title": "MMR Ranking of American and Caribbean Countries"},
                      {"selector_name": "Middle East and North African countries", "dataset": middleEast_northAfrica, "graph_title": "MMR Ranking of Middle East and North African Countries"},
                      {"selector_name": "Sub-Sahara African countries", "dataset": subsaharanAfrica, "graph_title": "MMR Ranking of Sub-Sahara African Countries"},
                      {"selector_name": "Asian and Pacific countries", "dataset": asian_pacific, "graph_title": "MMR Ranking of Asian and Pacific Countries"},

                    ];


  // create the dropdown menu (see Reference 3)
  var dropdownMenu = d3.select("#dropdownMenu")


  dropdownMenu
        .append("select")
        .selectAll("option")
        .data(dropdownDict)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.selector_name;
        })
        .text(function(d){
            return d.selector_name;
        });

  dropdownMenu
        .on('change', function(){

        var timeout=setTimeout(2000);
        // Find which option was selected from the dropdown
        var selector = d3.select(this)
        .select("select")
        .property("value")

        // (see Reference 6)
        var indexed = d3.map(dropdownDict, function(d) { return d.selector_name});
        var graph_dataset = indexed.get(selector).dataset;
        var graph_title = indexed.get(selector).graph_title;


        // remove previous chart's svg elements
        d3.selectAll(".chart_title").remove();
        d3.selectAll(".country-line").remove();
        d3.selectAll(".eachCountry").remove();
        d3.selectAll(".left-label").remove();
        d3.selectAll(".right-label").remove();
        svg.selectAll("g").remove();



        generate_bumpchart(graph_dataset, graph_title)


        });



  // Initialize bumpchart
  generate_bumpchart(high_income, "MMR Ranking of High Income Countries");

  // Auxilary function to format data (see Reference 4)
  function format_data(someDataset){
        var prepData1 = d3.nest()
          .key(function(d) { return d.name; })
          .key(function(d) { return d.year; })
          .rollup(function(d) {
            return {
              rank: d3.sum(d, function(e) {return e.rank}),
              iso: d3.sum(d, function(e) {return e.iso}),
              matdeath: d3.sum(d, function(e) {return e.matdeaths}),
              mmr: d3.sum(d, function(e) {return e.mmr})
            }
          })
          // .rollup(function(v) { return d3.sum(v, function(d) { return d.rank }); })
          .object(someDataset);
        var prepData2 = Object.entries(prepData1).map(([countryCode, yearDict]) => {
          return {
            name: countryCode,
            values: Object.entries(yearDict).map(([year, info]) => {
              return {year, info};
            })
          };
        });
        return prepData2
        console.log(prepData2)
        };


  // Chart generator
  function generate_bumpchart(graph_dataset, graph_title) {

        var dataReady = format_data(graph_dataset);
        console.log("HERE");
        console.log(dataReady);

        // x-axis
        var x = d3.scalePoint() //is there an issue that I use scalePoint instead of scaleBand?
          .domain([1985, 1990, 1995, 2000, 2005, 2010, 2015])
          .range([ margin.left , width ]);
        svg.append("g")
          .attr("transform", "translate(0," + (height) + ")")
          .call(d3.axisBottom(x))
          .call(g => g.select(".domain").remove()); // Citation to remove domain on x-axis:  https://github.com/d3/d3-axis/issues/48


        // y-axis
        var size = Object.keys(dataReady).length; // Y-axis as large as selection

        var y = d3.scaleLinear()
          .domain([1, size])
          .range([ margin.top, height ]);

        svg.append("g")
          .attr("transform","translate(155,0)") //moves the y-axis inward towards first
          .call(d3.axisLeft(y).ticks(size));


        // create line generator
        var lineGenerator = d3.line().curve(d3.curveMonotoneX) // D3 Curve Explorer:  http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
            .x( d => x(+d.year) )
            .y( d => y(+d.info.rank) );

        // var color = ["#E3DD44", "#BD9840", "#7102FA"]; //Yellow to Purple 4 gradient scale
        var color = ['#13394A', //dark blue
                '#E3DD44', //yellow
                '#357797', //mid blue
                // '#D4626F', //salmon
                '#948E00', //green
                '#CC149B', //fuschia
                '#7102FA', //purple
                '#E48023' //orange
              ];

        // var color = ["#E3DD44", "#C6A671", "#AA6F9F", "#8D38CC", "#7102FA"] //yellow to purple

        var chartTitle = svg
            .selectAll(".chart_title")
            .data([graph_title]);
        chartTitle
          .enter()
          .append("text")
            .attr("class", "chart_title")
            .attr("x", (width + margin.left + 70)/2)
            .attr("y", margin.top/2)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .merge(chartTitle)
            .text(d => d);


        // generate lines (see Reference 1)
        var lines = svg
          .selectAll(".country-line")
          .data(dataReady);
        lines
          .enter()
          .append("path")
            .attr("class", d => `country-line ${d.name}` )
            .attr("fill", "none")
            .merge(lines)
            .attr("d", d => lineGenerator(d.values) )
            .attr("stroke", function(d, i) { return color[i % 7];}) //mod by the number of colors
            .classed("highlight-off", true)
            .on("click", function(d) {
              d3.selectAll(`.${d.name}`).classed('highlight-on', !d3.selectAll(`.${d.name}`).classed('highlight-on'));
            })
            .on("mousemove", function(d) {
              d3.selectAll(`.${d.name}`).classed('highlight-hover', true); })
            .on("mouseout", function(d) {
              d3.selectAll(`.${d.name}`).classed('highlight-hover', false); })



        // Add the points (see Reference 1, 5)
        var countryRanking = svg
          .selectAll(".eachCountry")
          .data(dataReady.reduce((acc, row) => acc.concat(row.values), []));
        countryRanking
          .enter()
          .append("circle")
            .attr('class', 'eachCountry')
            .merge(countryRanking)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.info.rank))
            // .on("mouseover", function() {
            //   focus.style("display", null);
            // })
            .on("mouseout", function() {focus.style("display", "none"); })
            .on("mousemove", function(d) {
              var xPosition = d3.mouse(this)[0];
              var yPosition = d3.mouse(this)[1];
               focus
                 .style("left", (d3.event.pageX)+"px")
                 .style("top", (d3.event.pageY - 130)+"px")
                // .style("left", `${xPosition + 120}px`)
                // .style("top", `${yPosition - 35}px`)
                .style("display", "flex");
              focus.select("p")
                    .html("   Year: " + d.year +
                          "   Rank: " + d.info.rank +
                          "   MMR: " + d.info.mmr +
                          "   Total Deaths: " + d.info.matdeath)
            });


        // Add a label at the beginning of each line (see Reference 1)
        var leftLabel = svg
          .selectAll(".left-label")
          .data(dataReady);

        leftLabel
          .enter()
          .append("text")
              .attr("class", d => `left-label ${d.name}`)
              .attr("text-anchor", "end")
              .attr("x", -40)
              .attr("y", +5)
              .attr("font-size", 10)
              .merge(leftLabel)
              .datum(function(d) { return {name: d.name, value: d.values[0]}; }) // keep only the first value
              .text(function(d) { return d.name; })
              .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.info.rank) + ")"; }) // Put the text at the position of the last point
              .attr("fill", function(d, i) { return color[i % 7];}) //mod by the number of colors
              .classed("highlight-off", true)
              .on("click", function(d) {
                d3.selectAll(`.${d.name}`).classed('highlight-on', !d3.selectAll(`.${d.name}`).classed('highlight-on'));
              })
              .on("mousemove", function(d) {
                d3.selectAll(`.${d.name}`).classed('highlight-hover', true); })
              .on("mouseout", function(d) {
                d3.selectAll(`.${d.name}`).classed('highlight-hover', false); })


        // Add a label at the end of each line (see Reference 1)
        var rightLabel = svg
          .selectAll(".right-label")
          .data(dataReady);
        rightLabel
          .enter()
          .append("text")
              .attr("class", d => `right-label ${d.name}`)
              .attr("text-anchor", "start")
              .attr("x", 10)
              .attr("y", +5)
              .attr("font-size", 10)
              .merge(rightLabel)
              .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; }) // keep only the last value
              .text(function(d) { return d.name; })
              .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.info.rank) + ")"; }) // Put the text at the position of the last point
              .attr("fill", function(d, i) { return color[i % 7];}) //mod by the number of colors
              .classed("highlight-off", true)
              .on("click", function(d) {
                d3.selectAll(`.${d.name}`).classed('highlight-on', !d3.selectAll(`.${d.name}`).classed('highlight-on'));
              })
              .on("mousemove", function(d) {
                d3.selectAll(`.${d.name}`).classed('highlight-hover', true); })
              .on("mouseout", function(d) {
                d3.selectAll(`.${d.name}`).classed('highlight-hover', false); })

      };


};
