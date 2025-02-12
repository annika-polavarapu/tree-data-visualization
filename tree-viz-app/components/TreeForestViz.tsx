"use client";
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const TreeIcon = ({ size, color }) => (
  <svg 
    width={size} 
    height={size * 1.4} 
    viewBox="0 0 24 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Organic tree shape with multiple layers */}
    <path
      d="M12 2C8 7 3 10 3 16C3 22 21 22 21 16C21 10 16 7 12 2Z"
      fill={`url(#gradient-${color})`}
      stroke="darkgreen"
      strokeWidth="0.5"
    />
    <path
      d="M12 8C9 12 6 14 6 18C6 22 18 22 18 18C18 14 15 12 12 8Z"
      fill={`url(#gradient2-${color})`}
      stroke="darkgreen"
      strokeWidth="0.5"
    />
    <path
      d="M12 14C10 17 8 18 8 21C8 24 16 24 16 21C16 18 14 17 12 14Z"
      fill={`url(#gradient3-${color})`}
      stroke="darkgreen"
      strokeWidth="0.5"
    />
    {/* Tree trunk */}
    <rect
      x="11"
      y="24"
      width="2"
      height="10"
      fill="#8B4513"
    />
    {/* Gradients for tree layers */}
    <defs>
      <linearGradient id={`gradient-${color}`} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={color} />
        <stop offset="1" stopColor="darkgreen" />
      </linearGradient>
      <linearGradient id={`gradient2-${color}`} x1="12" y1="8" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={color} />
        <stop offset="1" stopColor="darkgreen" />
      </linearGradient>
      <linearGradient id={`gradient3-${color}`} x1="12" y1="14" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={color} />
        <stop offset="1" stopColor="darkgreen" />
      </linearGradient>
    </defs>
  </svg>
);

const TreeForestViz = () => {
  const [treeData, setTreeData] = useState([]);
  const [selectedGenus, setSelectedGenus] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/Data_Viz_Challenge_2025-UCB_Trees.csv');
        const text = await response.text();
        const result = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
      
        const genusData = {};
        result.data.forEach(tree => {
          if (!genusData[tree.Genus]) {
            genusData[tree.Genus] = {
              count: 0,
              totalHeight: 0,
              totalSpread: 0,
              species: new Set()
            };
          }
          genusData[tree.Genus].count++;
          genusData[tree.Genus].totalHeight += tree.Height || 0;
          genusData[tree.Genus].totalSpread += tree['Canopy Spread'] || 0;
          genusData[tree.Genus].species.add(tree.Species);
        });
      
        const processedData = Object.entries(genusData)
          .map(([genus, data]) => ({
            genus,
            count: data.count,
            avgHeight: data.totalHeight / data.count,
            avgSpread: data.totalSpread / data.count,
            speciesCount: data.species.size
          }))
          .filter(d => d.count > 0)
          .sort((a, b) => b.count - a.count);
      
        setTreeData(processedData);
      } catch (error) {
        console.error('Error loading tree data:', error);
      }
    };
    
    loadData();
  }, []);

  const getTreeColor = (count) => {
    const maxCount = Math.max(...treeData.map(d => d.count));
    // Enhanced color contrast - using more dramatic color shifts
    const intensity = Math.floor((count / maxCount) * 200); // Increased range
    return `rgb(${2 + intensity}, ${10 + intensity}, ${20})`; // More dramatic green variation
  };

  const getTreeSize = (height) => {
    const maxHeight = Math.max(...treeData.map(d => d.avgHeight));
    // Slightly smaller base size to fit more trees
    return 16 + (height / maxHeight) * 48;
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <h1 className="text-center text-3xl font-serif mb-8 text-black">Forest of Knowledge: UCB Campus Trees</h1>
        
        <div className="relative min-h-[32rem] h-auto w-full rounded-lg p-6 bg-gradient-to-b from-sky-100 to-green-50">
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            {selectedGenus ? (
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-green-800">{selectedGenus.genus}</h3>
                <p className="text-sm text-black">Population: {selectedGenus.count} trees</p>
                <p className="text-sm text-black">Average Height: {selectedGenus.avgHeight.toFixed(1)} ft</p>
                <p className="text-sm text-black">Species Diversity: {selectedGenus.speciesCount} varieties</p>
              </div>
            ) : (
              <p className="text-sm italic text-green-800">Hover over trees to explore...</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center items-end min-h-[28rem] pt-20 pb-8">
            {treeData.map((genus, i) => (
              <div
                key={genus.genus}
                className="flex flex-col items-center transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-2 cursor-pointer group"
                onMouseEnter={() => setSelectedGenus(genus)}
                onMouseLeave={() => setSelectedGenus(null)}
              >
                <TreeIcon
                  size={getTreeSize(genus.avgHeight)}
                  color={getTreeColor(genus.count)}
                />
                <span className="text-xs font-medium mt-2 rotate-45 origin-left text-green-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  {genus.genus}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600 text-center italic">
          A living visualization of our campus canopy. Each tree represents a genus, 
          with size reflecting average height and color intensity showing population.
        </div>
      </div>
    </div>
  );
};

export default TreeForestViz;