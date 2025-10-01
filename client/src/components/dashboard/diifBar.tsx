const DifficultyBar: React.FC<{
  label: string;
  solved: number;
  color: string;
}> = ({ label, solved, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-300 text-sm w-16">{label}</span>
    <div className="flex-1 mx-3 bg-gray-800 rounded-full h-2">
      <div 
        className={`${color} rounded-full h-2 transition-all duration-300`}
        style={{ width: `${Math.min(100, (solved / 50) * 100)}%` }}
      />
    </div>
    <span className="text-gray-400 text-sm w-8">{solved}</span>
  </div>
);

export default DifficultyBar;