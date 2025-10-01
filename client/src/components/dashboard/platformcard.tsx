import React from "react";

const PlatformCard: React.FC<{
  platform: {
    name: string;
    handle: string;
    rating?: number;
    totalSolved: number;
    rank?: string | number;
  };
}> = ({ platform }) => (
  <div className="p-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg">
    {platform.name && (
      <h4 className="font-semibold text-gray-200 mb-2">{platform.name}</h4>
    )}

    <div className="text-sm space-y-1">
      {platform.handle && platform.handle.trim() !== "" && (
        <div className="flex justify-between">
          <span className="text-gray-400">Handle:</span>
          <span className="text-gray-300">{platform.handle}</span>
        </div>
      )}

      {platform.rating != null && (
        <div className="flex justify-between">
          <span className="text-gray-400">Rating:</span>
          <span className="text-red-400 font-medium">{platform.rating}</span>
        </div>
      )}

      {platform.rank != null && platform.rank !== "" && (
        <div className="flex justify-between">
          <span className="text-gray-400">Rank:</span>
          <span className="text-red-400 font-medium">{platform.rank}</span>
        </div>
      )}

      {platform.totalSolved != null && platform.totalSolved > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-400">Solved:</span>
          <span className="text-red-400 font-medium">{platform.totalSolved}</span>
        </div>
      )}
    </div>
  </div>
);

export default PlatformCard;
