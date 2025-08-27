"use client";

import { useState, useEffect } from "react";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";

interface DualPinLoginProps {
  onSuccess: () => void;
}

export default function DualPinLogin({ onSuccess }: DualPinLoginProps) {
  const [email, setEmail] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [pinStage, setPinStage] = useState<"first" | "second">("first");
  const [firstPinComplete, setFirstPinComplete] = useState(false);
  const [error, setError] = useState("");

  const handleNumberClick = (num: string) => {
    if (currentPin.length < 4) {
      setCurrentPin(currentPin + num);
    }
    setError("");
  };

  const handleClear = () => {
    setCurrentPin("");
    setError("");
  };

  const handleBackspace = () => {
    setCurrentPin(currentPin.slice(0, -1));
    setError("");
  };

  // Auto-advance when PIN is complete
  useEffect(() => {
    if (currentPin.length === 4) {
      if (pinStage === "first") {
        // Validate first PIN
        if (currentPin === "1111") {
          setTimeout(() => {
            setFirstPinComplete(true);
            setPinStage("second");
            setCurrentPin("");
          }, 300);
        } else {
          setError("Invalid Security Code 1");
          setTimeout(() => {
            setCurrentPin("");
            setError("");
          }, 1000);
        }
      } else {
        // Validate second PIN and complete login
        if (currentPin === "4569" && email === "office@fltreeshop.com") {
          // Success - store in localStorage
          localStorage.setItem("authenticated", "true");
          localStorage.setItem("authTime", Date.now().toString());
          onSuccess();
        } else if (currentPin !== "4569") {
          setError("Invalid Security Code 2");
          setTimeout(() => {
            setCurrentPin("");
            setError("");
          }, 1000);
        } else {
          setError("Invalid email address");
        }
      }
    }
  }, [currentPin, pinStage, email, onSuccess]);

  const renderPinPad = () => {
    const isFirstStage = pinStage === "first";
    const color = isFirstStage ? "cyan" : "green";
    const colorClasses = {
      cyan: {
        text: "text-cyan-400",
        bg: "bg-cyan-400/10",
        hover: "hover:bg-cyan-400/20",
        border: "border-cyan-400/30",
        active: "bg-cyan-400/20",
      },
      green: {
        text: "text-green-500",
        bg: "bg-green-500/10",
        hover: "hover:bg-green-500/20",
        border: "border-green-500/30",
        active: "bg-green-500/20",
      },
    };
    const colors = colorClasses[color];

    return (
      <div className="flex flex-col items-center">
        {/* Stage Indicators */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex items-center gap-2 ${firstPinComplete ? "opacity-50" : ""}`}>
            <div className={`w-3 h-3 rounded-full ${
              isFirstStage && !firstPinComplete ? "bg-cyan-400 animate-pulse" : 
              firstPinComplete ? "bg-cyan-400/30" : "bg-gray-700"
            }`} />
            <span className={`text-sm ${firstPinComplete ? "text-gray-500" : "text-cyan-400"}`}>
              Security Code 1
            </span>
          </div>
          <span className="text-gray-600">→</span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              !isFirstStage ? "bg-green-500 animate-pulse" : "bg-gray-700"
            }`} />
            <span className={`text-sm ${!isFirstStage ? "text-green-500" : "text-gray-500"}`}>
              Security Code 2
            </span>
          </div>
        </div>
        
        {/* PIN Display */}
        <div className="flex gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-14 h-14 border-2 ${colors.border} rounded-lg flex items-center justify-center text-3xl transition-all ${
                currentPin[i] ? colors.bg : "bg-gray-900"
              }`}
            >
              {currentPin[i] ? "•" : ""}
            </div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className={`w-20 h-20 bg-gray-800 ${colors.hover} border border-gray-700 rounded-lg text-2xl font-medium transition-all active:scale-95`}
              disabled={currentPin.length >= 4}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="w-20 h-20 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-medium transition-all text-red-400 active:scale-95"
          >
            Clear
          </button>
          <button
            onClick={() => handleNumberClick("0")}
            className={`w-20 h-20 bg-gray-800 ${colors.hover} border border-gray-700 rounded-lg text-2xl font-medium transition-all active:scale-95`}
            disabled={currentPin.length >= 4}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-20 h-20 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/30 rounded-lg text-lg font-medium transition-all text-yellow-400 active:scale-95"
          >
            ←
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 text-green-500">TreeShop Terminal</h1>
          <p className="text-gray-400">Secure Access Portal</p>
        </div>

        {/* Email Input */}
        <Card className="mb-6 sm:mb-8">
          <div className="max-w-md mx-auto">
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
        </Card>

        {/* Single PIN Pad */}
        <Card>
          {renderPinPad()}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center text-red-400 animate-shake">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 text-center text-sm text-gray-500">
            {pinStage === "first" 
              ? "Enter first security code" 
              : "Enter second security code to access terminal"
            }
          </div>
        </Card>
      </div>
    </div>
  );
}