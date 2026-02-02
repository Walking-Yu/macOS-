import React, { useMemo } from 'react';

interface VirtualKeyboardProps {
  keyCounts: Record<string, number>;
  activeKeys: Set<string>;
}

const KEY_Layout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Opt', 'Cmd', 'Space', 'Cmd', 'Opt', 'Ctrl'] // Simplified bottom row
];

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ keyCounts, activeKeys }) => {
  
  const maxCount = useMemo(() => {
    const counts = Object.values(keyCounts);
    return counts.length > 0 ? Math.max(...counts) : 1;
  }, [keyCounts]);

  const getKeyColor = (key: string) => {
    const lowerKey = key.toLowerCase();
    
    // Check if currently pressed
    if (activeKeys.has(lowerKey)) {
      return 'bg-macos-accent text-white scale-95 shadow-inner';
    }

    // Heatmap calculation
    const count = keyCounts[lowerKey] || 0;
    const intensity = Math.min(count / (maxCount * 0.8), 1); // Normalize

    if (count === 0) return 'bg-white text-gray-700 shadow-sm';
    
    // Simple interpolation from white to blue
    if (intensity < 0.2) return 'bg-blue-50 text-gray-800 shadow-sm';
    if (intensity < 0.4) return 'bg-blue-100 text-gray-900 shadow-sm';
    if (intensity < 0.6) return 'bg-blue-200 text-gray-900 shadow-sm';
    if (intensity < 0.8) return 'bg-blue-300 text-gray-900 shadow-sm';
    return 'bg-blue-500 text-white shadow-sm';
  };

  const getKeyLabel = (key: string) => {
      if (key === 'Backspace') return '⌫';
      if (key === 'Tab') return '⇥';
      if (key === 'Caps') return '⇪';
      if (key === 'Enter') return '⏎';
      if (key === 'Shift') return '⇧';
      if (key === 'Ctrl') return '⌃';
      if (key === 'Opt') return '⌥';
      if (key === 'Cmd') return '⌘';
      if (key === 'Space') return '';
      return key.toUpperCase();
  };

  const getKeyWidth = (key: string) => {
      if (key === 'Backspace') return 'w-20';
      if (key === 'Tab') return 'w-16';
      if (key === 'Caps') return 'w-20';
      if (key === 'Enter') return 'w-24';
      if (key === 'Shift') return 'w-28';
      if (key === 'Space') return 'w-64';
      if (['Ctrl', 'Opt', 'Cmd'].includes(key)) return 'w-14';
      return 'w-10'; // Standard key width
  };

  return (
    <div className="bg-gray-200 p-6 rounded-2xl shadow-inner border border-gray-300 select-none">
      <div className="flex flex-col gap-2 items-center">
        {KEY_Layout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((key, keyIndex) => {
                const widthClass = getKeyWidth(key);
                const colorClass = getKeyColor(key === 'Space' ? ' ' : key);
                const label = getKeyLabel(key);
                
                return (
                    <div
                        key={`${rowIndex}-${keyIndex}`}
                        className={`${widthClass} h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-75 ease-out ${colorClass}`}
                    >
                        {label}
                    </div>
                );
            })}
          </div>
        ))}
      </div>
      <div className="text-center mt-4 text-xs text-gray-400">
          Heatmap visualization of your keystrokes. Darker blue indicates higher frequency.
      </div>
    </div>
  );
};

export default VirtualKeyboard;
