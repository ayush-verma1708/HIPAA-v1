import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, sankeyLeft } from 'd3-sankey';
import { getAllStatus } from '../api/completionStatusApi';

const LineageDiagram = () => {
  const [data, setData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statuses = await getAllStatus();
        console.log('Fetched statuses:', statuses); // Log fetched data
        const groupedData = processLineageData(statuses);
        console.log('Processed data:', groupedData); // Log processed data
        setData(groupedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const processLineageData = (statuses) => {
    const nodes = [];
    const links = [];
    let nodeIndex = 0;
    let totalControls = 0;
    let totalCompleted = 0;

    // First pass to count totals
    statuses.forEach((status) => {
      totalControls++;
      if (status.isCompleted) totalCompleted++;
    });

    // Create completion status nodes with sizes based on ratio
    const completedId = nodeIndex++;
    const incompleteId = nodeIndex++;

    nodes.push(
      {
        id: completedId,
        name: 'Completed',
        type: 'status',
        category: 'completed',
        size: totalCompleted,
      },
      {
        id: incompleteId,
        name: 'Incomplete',
        type: 'status',
        category: 'incomplete',
        size: totalControls - totalCompleted,
      }
    );

    // Process each status item individually
    statuses.forEach((status) => {
      const familyDesc = status.familyId.family_desc;
      const controlName = status.controlId.section_main_desc;

      // Create or get family node
      let familyNode = nodes.find(
        (n) => n.name === familyDesc && n.type === 'family'
      );
      if (!familyNode) {
        familyNode = {
          id: nodeIndex++,
          name: familyDesc,
          type: 'family',
          controls: new Set(),
          completed: 0,
          incomplete: 0,
        };
        nodes.push(familyNode);
      }

      // Add control to family and update counts
      familyNode.controls.add(controlName);
      if (status.isCompleted) {
        familyNode.completed++;
      } else {
        familyNode.incomplete++;
      }
    });

    // Create links based on completion status
    nodes.forEach((node) => {
      if (node.type === 'family') {
        if (node.completed > 0) {
          links.push({
            source: node.id,
            target: completedId,
            value: node.completed,
          });
        }
        if (node.incomplete > 0) {
          links.push({
            source: node.id,
            target: incompleteId,
            value: node.incomplete,
          });
        }
        // Add total controls count
        node.totalControls = node.controls.size;
        // Clean up temporary properties
        delete node.controls;
        delete node.completed;
        delete node.incomplete;
      }
    });

    return { nodes, links };
  };

  useEffect(() => {
    if (data.nodes.length === 0) return;

    const width = 1000;
    const height = 600;

    const svg = d3
      .select('#lineage')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    svg.selectAll('*').remove();

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'diagram-title')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .text('Control Family Completion Status');

    const sankeyGenerator = sankey()
      .nodeId((d) => d.id)
      .nodeAlign(sankeyLeft)
      .nodeWidth(30)
      .nodePadding(20)
      .extent([
        [50, 50],
        [width - 50, height - 50],
      ]);

    // Generate Sankey layout directly with numeric IDs
    const { nodes, links } = sankeyGenerator(data);

    // Draw links
    svg
      .append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d) =>
        d.target.category === 'completed' ? '#00cc44' : '#ff4444'
      )
      .attr('stroke-width', (d) => Math.max(1, d.width))
      .attr('opacity', 0.5)
      .on('mouseover', function () {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.5);
      });

    // Draw nodes
    const nodeGroup = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // Draw different shapes based on node type
    nodeGroup.each(function (d) {
      const node = d3.select(this);

      if (d.type === 'status') {
        // Calculate radius based on size
        const baseRadius = Math.min(d.y1 - d.y0, d.x1 - d.x0) / 2;
        const radius = baseRadius * Math.sqrt(d.size / 10); // Adjust scaling factor as needed

        // Draw circles for status nodes with dynamic size
        node
          .append('circle')
          .attr('r', radius)
          .attr('cx', (d.x1 - d.x0) / 2)
          .attr('cy', (d.y1 - d.y0) / 2)
          .attr('fill', d.category === 'completed' ? '#00cc44' : '#ff4444')
          .attr('opacity', 0.8);

        // Add count label
        node
          .append('text')
          .attr('x', (d.x1 - d.x0) / 2)
          .attr('y', (d.y1 - d.y0) / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .text(`${d.name} (${d.size})`);
      } else {
        // Draw rectangles for family nodes
        node
          .append('rect')
          .attr('height', d.y1 - d.y0)
          .attr('width', d.x1 - d.x0)
          .attr('fill', '#4477aa')
          .attr('opacity', 0.8)
          .attr('rx', 4)
          .attr('ry', 4);
      }

      // Add labels
      //   node
      //     .append('text')
      //     .attr('x', d.type === 'status' ? (d.x1 - d.x0) / 2 : 10)
      //     .attr('y', d.type === 'status' ? (d.y1 - d.y0) / 2 : (d.y1 - d.y0) / 2)
      //     .attr('dy', '0.35em')
      //     .attr('text-anchor', d.type === 'status' ? 'middle' : 'start')
      //     .attr('fill', 'white')
      //     .style('font-size', '12px')
      //     .style('pointer-events', 'none')
      //     .text((d) => (d.type === 'family' ? `${d.name} (${d.count})` : d.name));
    });
  }, [data]);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
      }}
    >
      <svg id='lineage' />
    </div>
  );
};

export default LineageDiagram;
