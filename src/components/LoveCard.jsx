import { useState } from "react";

export default function LoveCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="perspective-1000">
        <div
          onClick={() => setFlipped(!flipped)}
          className={`relative w-80 h-96 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-6">
            <h1 className="text-2xl font-bold text-pink-500">💌 For You</h1>
            <p className="text-gray-500 mt-4 text-center">
              Click the card to see something special
            </p>
          </div>

          {/* BACK */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-pink-400 to-red-400 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 text-white">
            <h1 className="text-xl font-semibold">Hey You ❤️</h1>
            <p className="mt-4 text-center text-lg">
              You’re my favorite thought when everything goes quiet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}