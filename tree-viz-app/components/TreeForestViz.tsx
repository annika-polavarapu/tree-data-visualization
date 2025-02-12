"use client";
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Search, SortAsc, Info } from 'lucide-react';

const TreeIcon = ({ size, color, isHighlighted }) => (
  <svg 
    width={size} 
    height={size * 1.4} 
    viewBox="0 0 24 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-500 ${isHighlighted ? 'scale-110' : 'scale-100'}`}
  >
    <path
      d="M12 2C7 8 2 12 2 18C2 24 22 24 22 18C22 12 17 8 12 2Z"
      fill={color}
      stroke="darkgreen"
      strokeWidth="0.5"
      opacity="0.9"
    />
    <path
      d="M12 7C8 12 4 15 4 20C4 25 20 25 20 20C20 15 16 12 12 7Z"
      fill={color}
      stroke="darkgreen"
      strokeWidth="0.5"
      opacity="0.95"
    />
    <path
      d="M12 12C9 16 6 18 6 22C6 26 18 26 18 22C18 18 15 16 12 12Z"
      fill={color}
      stroke="darkgreen"
      strokeWidth="0.5"
    />
    <rect
      x="11"
      y="24"
      width="2"
      height="10"
      fill="#8B4513"
    />
  </svg>
);

// const ColorLegend = ({ getTreeColor }) => (
//   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
//     <h4 className="text-sm font-semibold mb-2 text-black">Population Ranges</h4>
//     <div className="space-y-1">
//       {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(i => (
//         <div key={i} className="flex items-center gap-2">
//           <div 
//             className="w-4 h-4 rounded"
//             style={{ backgroundColor: getTreeColor(i * 0.1 + 0.05) }}
//           />
//           <span className="text-xs text-black">{i * 10}-{(i + 1) * 10}%</span>
//         </div>
//       ))}
//     </div>
//   </div>
// );

const TreeForestViz = () => {
  const [treeData, setTreeData] = useState([]);
  const [selectedGenus, setSelectedGenus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("count");
  const [showLegend, setShowLegend] = useState(true);
  
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
          .filter(d => d.count > 0);
      
        setTreeData(processedData);
      } catch (error) {
        console.error('Error loading tree data:', error);
      }
    };
    
    loadData();
  }, []);

  const getTreeColor = (count) => {
    const maxCount = Math.max(...treeData.map(d => d.count));
    const ratio = count / maxCount;
    
    if (ratio > 0.9) {
      return '#004B00';
    } else if (ratio > 0.8) {
      return '#006400';
    } else if (ratio > 0.7) {
      return '#008000';
    } else if (ratio > 0.6) {
      return '#228B22';
    } else if (ratio > 0.5) {
      return '#32CD32';
    } else if (ratio > 0.4) {
      return '#90EE90';
    } else if (ratio > 0.3) {
      return '#98FB98';
    } else if (ratio > 0.2) {
      return '#B4EEB4';
    } else if (ratio > 0.1) {
      return '#C1FFC1';
    } else {
      return '#E0FFE0';
    }
  };

  const getTreeSize = (height) => {
    const maxHeight = Math.max(...treeData.map(d => d.avgHeight));
    return 16 + (height / maxHeight) * 48;
  };

  const sortedAndFilteredTrees = [...treeData]
    .filter(tree => 
      tree.genus.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "height":
          return b.avgHeight - a.avgHeight;
        case "diversity":
          return b.speciesCount - a.speciesCount;
        case "spread":
          return b.avgSpread - a.avgSpread;
        default:
          return b.count - a.count;
      }
    });

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <h1 className="text-center text-3xl font-serif mb-8 text-black">Forest of Knowledge: UCB Campus Trees</h1>
        
        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search genera..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="count">Sort by Population</option>
            <option value="height">Sort by Height</option>
            <option value="diversity">Sort by Species Count</option>
            <option value="spread">Sort by Canopy Spread</option>
          </select>
          {/* <button
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            onClick={() => setShowLegend(!showLegend)}
          >
            <Info size={20} className="text-gray-600" />
          </button> */}
        </div>
        
        <div className="relative min-h-[32rem] h-auto w-full rounded-lg p-6 bg-gradient-to-b from-sky-100 to-green-50 pt-32">
          {/* Info Panel */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            {selectedGenus ? (
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-green-800">{selectedGenus.genus}</h3>
                <p className="text-sm text-black">Population: {selectedGenus.count} trees</p>
                <p className="text-sm text-black">Average Height: {selectedGenus.avgHeight.toFixed(1)} ft</p>
                <p className="text-sm text-black">Species Diversity: {selectedGenus.speciesCount} varieties</p>
                <p className="text-sm text-black">Average Spread: {selectedGenus.avgSpread.toFixed(1)} ft</p>
              </div>
            ) : (
              <p className="text-sm italic text-green-800">Hover over trees to explore...</p>
            )}
          </div>

          {/* Color Legend */}
          {/* {showLegend && <ColorLegend getTreeColor={getTreeColor} />} */}
          
          {/* Tree Visualization */}
          <div className="flex flex-wrap gap-6 justify-center items-end min-h-[28rem] pt-20 pb-8">
            {sortedAndFilteredTrees.map((genus) => (
              <div
                key={genus.genus}
                className="flex flex-col items-center transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-2 cursor-pointer group"
                onMouseEnter={() => setSelectedGenus(genus)}
                onMouseLeave={() => setSelectedGenus(null)}
              >
                <TreeIcon
                  size={getTreeSize(genus.avgHeight)}
                  color={getTreeColor(genus.count)}
                  isHighlighted={searchTerm && genus.genus.toLowerCase().includes(searchTerm.toLowerCase())}
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