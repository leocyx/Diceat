"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface DiceProps {
  items: string[];
  onFinish?: (winner: string) => void;
}

const Dice: React.FC<DiceProps> = ({ items, onFinish }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [faces, setFaces] = useState<string[]>(Array(6).fill("?"));
  const [winner, setWinner] = useState<string | null>(null);
  const controls = useAnimation();

  // items 改變時重設骰子（切換群組時清除上次結果）
  useEffect(() => {
    if (items.length > 0) {
      const newFaces = Array(6)
        .fill(null)
        .map((_, i) => items[i % items.length]);
      setFaces(newFaces);
      setWinner(null);
    }
  }, [items]);

  const roll = async () => {
    if (isRolling || items.length === 0) return;

    setIsRolling(true);
    setWinner(null);

    // 1. 預先決定最終贏家
    const finalWinner = items[Math.floor(Math.random() * items.length)];

    // 2. 執行 3D 旋轉動畫
    // 旋轉角度設定為 360 的倍數 (1440)，確保最後正面朝前 (Front Face)
    await controls.start({
      rotateX: [0, 720, 1440],
      rotateY: [0, 1080, 1440],
      transition: { duration: 2.5, ease: "easeInOut" },
    });

    // 3. 鎖定結果：將贏家顯示在正面 (index 0)
    setFaces((prev) => {
      const newFaces = [...prev];
      newFaces[0] = finalWinner;
      return newFaces;
    });

    setIsRolling(false);
    setWinner(finalWinner);

    // 瞬間多重繽紛爆發
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    const fire = (particleRatio: number, opts: any) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ["#6366f1", "#fbbf24", "#ec4899", "#ffffff"],
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    if (onFinish) onFinish(finalWinner);
  };

  const faceTransforms = [
    "translateZ(100px)", // Front
    "rotateY(180deg) translateZ(100px)", // Back
    "rotateY(90deg) translateZ(100px)", // Right
    "rotateY(-90deg) translateZ(100px)", // Left
    "rotateX(90deg) translateZ(100px)", // Top
    "rotateX(-90deg) translateZ(100px)", // Bottom
  ];

  return (
    <div className="relative pt-10 text-center w-full flex flex-col items-center">
      <div
        className="relative w-[200px] h-[200px] mb-22"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={controls}
          initial={{ rotateX: 0, rotateY: 0 }}
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          {faces.map((name, index) => (
            <div
              key={index}
              className="absolute w-full h-full border-2 border-indigo-100 bg-white flex items-center justify-center p-4 text-center font-bold text-indigo-600 text-lg shadow-xl rounded-2xl"
              style={{
                transform: faceTransforms[index],
                backfaceVisibility: "hidden",
              }}
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
      <button
        onClick={roll}
        disabled={isRolling || items.length === 0}
        className={`px-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-xl shadow-lg transition-all relative z-20 cursor-pointer
          ${isRolling ? "opacity-50 cursor-not-allowed scale-95" : "hover:bg-indigo-700 hover:scale-105 active:scale-95"}
        `}
      >
        {isRolling ? "抽選中..." : "今天吃什麼？"}
      </button>
      <div className="h-20 mt-8 flex items-center justify-center">
        <AnimatePresence>
          {winner && !isRolling && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-indigo-50 border border-indigo-100 px-8 py-4 rounded-2xl text-2xl font-black text-indigo-700 shadow-sm"
            >
              🎉 就決定是：{winner}！
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dice;
