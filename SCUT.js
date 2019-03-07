
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


  var dataReady = [
    {"iso": "USA",
    "values":[
      {"year":1985, "rank":2},
      {"year":2005, "rank":10},
      {"year":2015, "rank":12}]},
    {"iso": "POL",
    "values":[
      {"year":1990, "rank":2},
      {"year":2000, "rank":17},
      {"year":2015, "rank":12}]},
    {"iso": "GRC",
    "values":[
      {"year":1985, "rank":8},
      {"year":1990, "rank":8},
      {"year":2015, "rank":2}]},
    {"iso": "FRA",
    "values":[
      {"year":1990, "rank":2},
      {"year":2005, "rank":10},
      {"year":2015, "rank":12}]
    }];



    const data1 = d3.nest()
      .key( d => d.iso)
      .key( d => d.year)
      .rollup(function(v) { return d3.sum(v, function(d) { return d.rank; }); })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.name; }); })
      .object(high_income);
    console.log('data1');
    console.log(data1);
    const data2 = Object.entries(data1).map(([countryCode, yearDict]) => {
      return {
        iso: countryCode,
        values: Object.entries(yearDict).map(([year, rank]) => {
          return {year, rank};
        })
      };
    });
    console.log('data2');
    console.log(data2);
