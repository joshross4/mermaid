import { select } from 'd3-selection';
import { venn } from 'venn.js';
import { interpolateRgb } from 'd3-interpolate';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

export const render = function(parsedData, svg, config = {}) {
  const width = config.width || 500;
  const height = config.height || 500;
  const padding = config.padding || 15;

  // Process the parsed data
  const sets = [];
  const intersections = [];
  const styles = {};
  let title = '';

  parsedData.forEach(item => {
    switch (item.type) {
      case 'set':
        sets.push({ sets: [item.id], size: item.size || 1 });
        break;
      case 'intersect':
        intersections.push({ 
          sets: item.sets, 
          size: item.size || 1,
          label: item.label
        });
        break;
      case 'style':
        styles[item.id] = item.attributes.reduce((acc, attr) => {
          acc[attr.key] = attr.value;
          return acc;
        }, {});
        break;
      case 'title':
        title = item.text;
        break;
    }
  });

  // Combine sets and intersections
  const data = sets.concat(intersections);

  // Create the layout
  const layout = venn.venn(data, { padding: padding });

  // Create the diagram
  const diagram = venn.VennDiagram()
    .width(width)
    .height(height);

  // Render the diagram
  const venns = select(svg)
    .datum(layout)
    .call(diagram);

  // Color scale for sets without defined colors
  const colorScale = scaleOrdinal(schemeCategory10);

  // Apply styles and labels
  venns.selectAll("path")
    .style("fill-opacity", (d) => {
      const setId = d.sets[0];
      return styles[setId] && styles[setId].opacity ? styles[setId].opacity : 0.5;
    })
    .style("stroke", "#fff")
    .style("stroke-width", 3)
    .style("stroke-opacity", 1)
    .style("fill", (d) => {
      const setId = d.sets[0];
      return styles[setId] && styles[setId].fill ? styles[setId].fill : colorScale(setId);
    })
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // Enhanced text styling
  venns.selectAll("text")
    .style("fill", "#444")
    .style("font-size", (d) => d.sets.length > 1 ? "12px" : "14px")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text((d) => {
      if (d.sets.length === 1) {
        return d.sets[0] + (d.size ? ` (${d.size})` : '');
      }
      return '';
    });

  // Add intersection labels with improved positioning
  intersections.forEach(intersection => {
    if (intersection.label) {
      const filteredCircles = layout.filter(d => 
        d.sets.length === intersection.sets.length && 
        d.sets.every(set => intersection.sets.includes(set))
      );
      
      if (filteredCircles.length > 0) {
        const circle = filteredCircles[0];
        select(svg)
          .append("text")
          .attr("x", circle.x)
          .attr("y", circle.y)
          .style("fill", "#444")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("text-anchor", "middle")
          .style("alignment-baseline", "middle")
          .style("pointer-events", "none")
          .text(intersection.label + (circle.size ? ` (${circle.size})` : ''));
      }
    }
  });

  // Add title with enhanced styling
  if (title) {
    select(svg)
      .append("text")
      .attr("x", width / 2)
      .attr("y", padding)
      .style("fill", "#333")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("text-anchor", "middle")
      .text(title);
  }

  // Add legend
  addLegend(svg, sets, styles, colorScale, width, height);

  // Mouse event handlers
  function handleMouseOver(d, i) {
    // Highlight the hovered set
    select(this)
      .transition()
      .style("fill-opacity", 0.8)
      .style("stroke", "#000")
      .style("stroke-width", 4);
    
    // Dim other sets
    venns.selectAll("path").filter(function() { return this !== i; })
      .transition()
      .style("fill-opacity", 0.2);
  }

  function handleMouseOut() {
    // Restore original styles
    venns.selectAll("path")
      .transition()
      .style("fill-opacity", (d) => {
        const setId = d.sets[0];
        return styles[setId] && styles[setId].opacity ? styles[setId].opacity : 0.5;
      })
      .style("stroke", "#fff")
      .style("stroke-width", 3);
  }

  // Legend creation
  function addLegend(svg, sets, styles, colorScale, width, height) {
    const legend = select(svg)
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100}, ${height - 20 - (sets.length * 20)})`);

    sets.forEach((set, index) => {
      const setId = set.sets[0];
      const color = styles[setId] && styles[setId].fill ? styles[setId].fill : colorScale(setId);
      
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${index * 20})`);

      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", color);

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(setId)
        .style("font-size", "12px")
        .style("fill", "#444");
    });
  }
};

export default render;