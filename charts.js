
// guy on stack overflow recomended making own function for .get() equivalent
// https://stackoverflow.com/questions/9907419/how-to-get-a-key-in-a-javascript-object-by-its-value
function getKey(dictionary, value) {
  return Object.keys(dictionary).find(key => dictionary[key] === value);
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samplesArray = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var filteredSamples = samplesArray.filter(x => x.id == sample);
    //  5. Create a variable that holds the first sample in the array.
    var sampleDict = filteredSamples[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = sampleDict.otu_ids
    var otuLabels = sampleDict.otu_labels
    var sampleValues = sampleDict.sample_values

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    let dict = {};
    Object.keys(sampleDict.otu_ids).forEach(x => {
        dict[sampleDict.otu_ids[x]] = sampleDict.sample_values[x];
    })
    let sortedValues = Object.values(dict).sort((a,b) => b-a).slice(0, 10);
    let sortedKeys = sortedValues.map(x => getKey(dict, x));
    var sortedNames = [];
    sortedValues.forEach(val => {
        sortedNames.push(sampleDict.otu_labels[getKey(sampleDict.sample_values, val)]);
    });

    // 8. Create the trace for the bar chart. 
    let bacSpecies = sortedNames.map(x=> x.split(";").slice(-1)[0])
    var barData = [{
      x: sortedValues, 
      y: bacSpecies, 
      type: "bar", 
      marker: {
        color: sortedValues,
        colorscale: "YlGnBu"
      },
      orientation: "h",
    }];
    // replace bacSpecies with sortedKeys to have ids as the identifier in plotly bar graph

    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: `Participant #${sample} Bacteria Cultures Bar Plot`
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);
    // console.log(sortedNames.map(x=> x.split(";")));
    // console.log(sortedValues);


    // bubble chart

    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: otuIds,
      y: sampleValues,
      mode: "markers",
      text: otuLabels,
      marker: {
        size: sampleValues,
        color: otuIds,
        colorscale: "Jet"
      }
    }];

    // not showing up for some reason
    console.log("working")

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bubble Chart for Bacteria Species"
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    // console.log(sampleValues);
    // console.log(otuIds);
    // console.log(otuLabels);


    // guage chart
    var metadataArray = data.metadata;
    var filteredMetadata = metadataArray.filter(x => x.id == sample);
    var metadataDict = filteredMetadata[0];
    // console.log(metadataDict.wfreq);

    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain: {x: [0, 1], y: [0, 1]},
      value: metadataDict.wfreq,
      title: "Participant Bellybutton wash Frequency",
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: {range: [0, 10]},
        bgcolor: "#FFF6A1",
        shape: "angular",
        bar: {color: "#52bf90", thickness: .3},
        steps: [
          {range: [0, 2], color: "#ffb3ba"},
          {range: [2, 4], color: "#ffdfba"},
          {range: [4, 6], color: "#ffffba"},
          {range: [6, 8], color: "#baffc9"},
          {range: [8, 10], color: "#bae1ff"}
        ]
      }
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
     width: 600,
     height: 450,
     margin: {t: 0, b: 0}
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);

  });
}
console.log("2")