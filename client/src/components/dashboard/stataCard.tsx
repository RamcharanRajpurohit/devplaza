const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-6">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg bg-gradient-to-r ${color} bg-opacity-20`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
      {value.toLocaleString()}
    </p>
    <p className="text-gray-400 text-sm mt-1">{title}</p>
  </div>
);

export default StatCard;