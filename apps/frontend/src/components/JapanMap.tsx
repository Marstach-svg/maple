'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import japanData from '@/data/japan-simple.json';
import type { Pin, PrefectureStats } from '@maple/shared';

interface JapanMapProps {
  pins: Pin[];
  prefectureStats: PrefectureStats[];
  onPinClick?: (pin: Pin) => void;
  onMapClick?: (coordinates: [number, number], prefecture: string) => void;
}

export default function JapanMap({ pins, prefectureStats, onPinClick, onMapClick }: JapanMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.min(container.clientWidth * 0.75, 600),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    
    console.log('JapanMap: Starting map render');
    console.log('JapanMap: Pins data:', pins);
    console.log('JapanMap: Prefecture stats:', prefectureStats);
    console.log('JapanMap: Dimensions:', dimensions);
    console.log('JapanMap: Rendering map...');

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = geoMercator()
      .center([138, 38])
      .scale(dimensions.width * 1.2)
      .translate([dimensions.width / 2, dimensions.height / 2]);

    const path = geoPath().projection(projection);

    const maxCount = Math.max(...prefectureStats.map(s => s.count), 1);
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, maxCount])
      .range(['#fce7f3', '#be185d']);

    const g = svg.append('g');
    
    console.log('JapanMap: Japan data features:', japanData.features.length);

    g.selectAll('path')
      .data(japanData.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', (d) => {
        const stat = prefectureStats.find(s => s.prefecture === d.properties.name);
        const color = stat ? colorScale(stat.count) : '#e5e7eb';
        console.log(`Prefecture ${d.properties.name}: color = ${color}`);
        return color;
      })
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        if (onMapClick) {
          const [x, y] = d3.pointer(event, this);
          const coordinates = projection.invert!([x, y]) as [number, number];
          onMapClick(coordinates, d.properties.name);
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-width', 2);
        
        const stat = prefectureStats.find(s => s.prefecture === d.properties.name);
        const tooltip = d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .html(`${d.properties.name}: ${stat ? stat.count : 0}件`);
        
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 1);
        d3.selectAll('.tooltip').remove();
      });

    pins.forEach(pin => {
      const coords = projection([pin.longitude, pin.latitude]);
      if (coords) {
        g.append('circle')
          .attr('cx', coords[0])
          .attr('cy', coords[1])
          .attr('r', 6)
          .attr('fill', '#ec4899')
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('click', () => onPinClick?.(pin))
          .on('mouseover', function(event) {
            d3.select(this).attr('r', 8);
            
            const tooltip = d3.select('body')
              .append('div')
              .attr('class', 'pin-tooltip')
              .style('position', 'absolute')
              .style('background', 'rgba(0, 0, 0, 0.9)')
              .style('color', 'white')
              .style('padding', '8px')
              .style('border-radius', '4px')
              .style('font-size', '12px')
              .style('pointer-events', 'none')
              .style('z-index', '1000')
              .html(`
                <div><strong>${pin.title}</strong></div>
                <div>${pin.prefecture}</div>
                ${pin.description ? `<div>${pin.description}</div>` : ''}
              `);
            
            tooltip
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 10) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this).attr('r', 6);
            d3.selectAll('.pin-tooltip').remove();
          });
      }
    });

  }, [dimensions, pins, prefectureStats, onPinClick, onMapClick]);

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-300 rounded-lg bg-blue-50"
      />
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          クリックして新しい場所を追加
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">訪問回数:</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4" style={{ backgroundColor: '#fce7f3' }}></div>
            <span className="text-xs">少</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4" style={{ backgroundColor: '#be185d' }}></div>
            <span className="text-xs">多</span>
          </div>
        </div>
      </div>
    </div>
  );
}