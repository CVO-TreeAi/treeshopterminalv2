"use client";

import { useState } from "react";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";

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
    const color = side === "left" ? "cyan" : "green";
    const colorClasses = {
      cyan: {
        text: "text-cyan-400",
        bg: "bg-cyan-400/10",
        hover: "hover:bg-cyan-400/20",
        border: "border-cyan-400/30",
      },
      green: {
        text: "text-green-500",
        bg: "bg-green-500/10",
        hover: "hover:bg-green-500/20",
        border: "border-green-500/30",
      },
    };
    const colors = colorClasses[color];

    return (
      <div className="flex flex-col items-center">
        <h3 className={`text-lg font-medium mb-4 ${colors.text}`}>
          {side === "left" ? "Security Code 1" : "Security Code 2"}
        </h3>
        
        {/* PIN Display */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 border-2 ${colors.border} rounded-lg flex items-center justify-center text-2xl transition-all ${
                pin[i] ? colors.bg : "bg-gray-900"
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
              className={`w-16 h-16 bg-gray-800 ${colors.hover} border border-gray-700 rounded-lg text-xl font-medium transition-all`}
              disabled={pin.length >= 4}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleClear(side)}
            className="w-16 h-16 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-medium transition-all text-red-400"
          >
            Clear
          </button>
          <button
            onClick={() => handleNumberClick("0", side)}
            className={`w-16 h-16 bg-gray-800 ${colors.hover} border border-gray-700 rounded-lg text-xl font-medium transition-all`}
            disabled={pin.length >= 4}
          >
            0
          </button>
          <button
            onClick={() => handleBackspace(side)}
            className="w-16 h-16 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/30 rounded-lg text-sm font-medium transition-all text-yellow-400"
          >
            ←
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 text-green-500">TreeShop Terminal</h1>
          <p className="text-gray-400">Secure Access Portal</p>
        </div>

        {/* Email Input */}
        <Card className="mb-8">
          <div className="max-w-md mx-auto">
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="office@fltreeshop.com"
            />
          </div>
        </Card>

        {/* Dual PIN Pads */}
        <Card>
          <div className="grid grid-cols-2 gap-12">
            {renderPinPad("left")}
            <div className="border-l border-gray-700"></div>
            {renderPinPad("right")}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center text-red-400">
              {error}
            </div>
          )}

          {/* Login Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleLogin}
              disabled={!email || leftPin.length !== 4 || rightPin.length !== 4}
              variant="primary"
              size="lg"
              className="min-w-[200px]"
            >
              Access Terminal
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Enter email and both security codes to access the terminal
          </div>
        </Card>
      </div>
    </div>
  );
}