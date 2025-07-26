import React from 'react';

export const LavaLamp = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-pulse opacity-20"></div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-xl animate-bounce opacity-30"></div>
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-xl animate-bounce opacity-30" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-full blur-xl animate-bounce opacity-30" style={{ animationDelay: '2s' }}></div>

      {/* Additional floating elements */}
      <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-lg animate-pulse opacity-20"></div>
      <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-lg animate-pulse opacity-20" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};
