"use client";

import { useState } from "react";

interface DualPinLoginProps {
  onSuccess: () => void;
}

export default function DualPinLogin({ onSuccess }: DualPinLoginProps) {
  const [email, setEmail] = useState("");
  const [leftPin, setLeftPin] = useState("");
  const [rightPin, setRightPin] = useState("");
  const [error, setError] = useState("");

  const handleNumberClick = (num: string, side: "left" | "right") => {
    if (side === "left" && leftPin.length < 4) {
      setLeftPin(leftPin + num);
    } else if (side === "right" && rightPin.length < 4) {
      setRightPin(rightPin + num);
    }
    setError("");
  };

  const handleClear = (side: "left" | "right") => {
    if (side === "left") {
      setLeftPin("");
    } else {
      setRightPin("");
    }
    setError("");
  };

  const handleBackspace = (side: "left" | "right") => {
    if (side === "left") {
      setLeftPin(leftPin.slice(0, -1));
    } else {
      setRightPin(rightPin.slice(0, -1));
    }
    setError("");
  };

  const handleLogin = () => {
    // Check email
    if (email !== "office@fltreeshop.com") {
      setError("Invalid email address");
      return;
    }

    // Check PINs
    if (leftPin !== "1111") {
      setError("Invalid left PIN");
      return;
    }

    if (rightPin !== "4569") {
      setError("Invalid right PIN");
      return;
    }

    // Success - store in localStorage
    localStorage.setItem("authenticated", "true");
    localStorage.setItem("authTime", Date.now().toString());
    onSuccess();
  };

  const renderPinPad = (side: "left" | "right") => {
    const pin = side === "left" ? leftPin : rightPin;
    const color = side === "left" ? "blue" : "green";

    return (
      <div className="flex flex-col items-center">
        <h3 className={`text-lg font-medium mb-4 text-${color}-400`}>
          {side === "left" ? "Security Code 1" : "Security Code 2"}
        </h3>
        
        {/* PIN Display */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 border-2 border-gray-600 rounded flex items-center justify-center text-2xl ${
                pin[i] ? `bg-${color}-900/50` : "bg-gray-800"
              }`}
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString(), side)}
              className={`w-16 h-16 bg-gray-700 hover:bg-${color}-800 rounded-lg text-xl font-medium transition-colors`}
              disabled={pin.length >= 4}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleClear(side)}
            className="w-16 h-16 bg-red-900 hover:bg-red-800 rounded-lg text-sm font-medium transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => handleNumberClick("0", side)}
            className={`w-16 h-16 bg-gray-700 hover:bg-${color}-800 rounded-lg text-xl font-medium transition-colors`}
            disabled={pin.length >= 4}
          >
            0
          </button>
          <button
            onClick={() => handleBackspace(side)}
            className="w-16 h-16 bg-yellow-900 hover:bg-yellow-800 rounded-lg text-sm font-medium transition-colors"
          >
            ←
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">TreeShop Terminal</h1>
          <p className="text-gray-400">Secure Access Portal</p>
        </div>

        {/* Email Input */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="office@fltreeshop.com"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
        </div>

        {/* Dual PIN Pads */}
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="grid grid-cols-2 gap-12">
            {renderPinPad("left")}
            <div className="border-l border-gray-700"></div>
            {renderPinPad("right")}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Login Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleLogin}
              disabled={!email || leftPin.length !== 4 || rightPin.length !== 4}
              className={`px-8 py-4 rounded-lg text-lg font-medium transition-colors ${
                email && leftPin.length === 4 && rightPin.length === 4
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 cursor-not-allowed opacity-50"
              }`}
            >
              Access Terminal
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Enter email and both security codes to access the terminal
          </div>
        </div>
      </div>
    </div>
  );
}