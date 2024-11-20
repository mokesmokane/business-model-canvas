'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GridEditorProps {
  columns: string;
  rows: string;
  areas: string[];
  onChange: (layout: { gridTemplate: { columns: string; rows: string }; areas: string[] }) => void;
}

export function GridEditor({ columns, rows, areas, onChange }: GridEditorProps) {
  const [gridSize, setGridSize] = useState({
    cols: columns.split(' ').length,
    rows: rows.split(' ').length,
  });
  
  const [selectedArea, setSelectedArea] = useState('');
  const [currentAreas, setCurrentAreas] = useState<string[][]>(
    parseAreasToGrid(areas, gridSize.rows, gridSize.cols)
  );

  function parseAreasToGrid(areas: string[], rows: number, cols: number) {
    return areas.map(row => row.split(' '));
  }

  function handleCellClick(rowIndex: number, colIndex: number) {
    if (!selectedArea) return;

    const newAreas = [...currentAreas.map(row => [...row])];
    if (newAreas[rowIndex][colIndex] !== selectedArea) {
      newAreas[rowIndex][colIndex] = selectedArea;
      setCurrentAreas(newAreas);

      // Convert back to the format expected by the parent
      const newAreasString = newAreas.map(row => row.join(' '));
      onChange({
        gridTemplate: { columns, rows },
        areas: newAreasString,
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          type="number"
          value={gridSize.cols}
          onChange={(e) => {
            const newCols = parseInt(e.target.value);
            if (newCols !== gridSize.cols) {
              setGridSize(prev => ({ ...prev, cols: newCols }));
              onChange({
                gridTemplate: { 
                  columns: Array(newCols).fill('1fr').join(' '),
                  rows 
                },
                areas
              });
            }
          }}
          className="w-20"
          min={1}
          max={6}
        />
        <span>×</span>
        <Input
          type="number"
          value={gridSize.rows}
          onChange={(e) => {
            const newRows = parseInt(e.target.value);
            if (newRows !== gridSize.rows) {
              setGridSize(prev => ({ ...prev, rows: newRows }));
              onChange({
                gridTemplate: { 
                  columns,
                  rows: Array(newRows).fill('auto').join(' ')
                },
                areas
              });
            }
          }}
          className="w-20"
          min={1}
          max={6}
        />
      </div>

      <div 
        className="border rounded-lg p-4"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
          gap: '4px',
        }}
      >
        {Array.from({ length: gridSize.rows * gridSize.cols }).map((_, i) => {
          const rowIndex = Math.floor(i / gridSize.cols);
          const colIndex = i % gridSize.cols;
          const areaName = currentAreas[rowIndex]?.[colIndex] || '.';

          return (
            <div
              key={i}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`
                aspect-square border rounded flex items-center justify-center
                ${areaName === '.' ? 'bg-gray-200' : 'bg-blue-500 text-white'}
              `}
            >
              {areaName}
            </div>
          );
        })}
      </div>
    </div>
  );
} 