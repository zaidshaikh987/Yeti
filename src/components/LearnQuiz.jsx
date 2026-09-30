import React, { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";

const QUESTIONS = [
  {
    q: "What is sea ice?",
    options: ["Frozen freshwater from glaciers", "Frozen seawater that forms on the ocean surface", "Ice that falls as snow", "Frozen rivers in polar regions"],
    answer: 1,
    explain: "Sea ice is frozen seawater that forms, grows and melts on the ocean surface. It differs from ice shelves and glacier ice.",
  },
  {
    q: "Which are India's research stations in Antarctica?",
    options: ["Himadri and Himansh", "Bharati and Maitri", "Dakshin Gangotri only", "Bharati and Himadri"],
    answer: 1,
    explain: "Bharati and Maitri are India's active research stations in Antarctica. Dakshin Gangotri was the first, now decommissioned.",
  },
  {
    q: "Where is India's Arctic research station Himadri located?",
    options: ["Greenland", "Norway (Svalbard)", "Canada", "Alaska"],
    answer: 1,
    explain: "Himadri is located in Ny-Ålesund, Svalbard, Norway — a major hub for international Arctic research.",
  },
  {
    q: "Why is the albedo effect important in polar regions?",
    options: [
      "It causes auroras",
      "Light surfaces like ice reflect sunlight, cooling the planet",
      "It measures ocean depth",
      "It describes animal migration",
    ],
    answer: 1,
    explain: "Ice and snow have high albedo — they reflect most sunlight back to space. As ice melts, darker ocean absorbs more heat, accelerating warming.",
  },
  {
    q: "Which organization manages India's polar research program?",
    options: ["ISRO", "NCPOR — National Centre for Polar and Ocean Research", "DRDO", "IMD"],
    answer: 1,
    explain: "NCPOR, under the Ministry of Earth Sciences, is India's premier institution for polar and ocean research.",
  },
];

export default function LearnQuiz({ onClose }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === QUESTIONS[current].answer) setScore(s => s + 1);
  };

  const next = () => {
    if (current + 1 < QUESTIONS.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
  };

  if (showResult) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${pct >= 60 ? "bg-green-100" : "bg-amber-100"}`}>
          <Trophy className={`h-10 w-10 ${pct >= 60 ? "text-green-600" : "text-amber-600"}`} />
        </div>
        <h3 className="mt-4 text-xl font-bold text-[#071A2B]">Quiz Complete!</h3>
        <p className="mt-1 text-sm text-muted-foreground">You scored {score} out of {QUESTIONS.length} ({pct}%)</p>
        <p className="mt-2 text-sm font-medium text-[#4DA8D8]">
          {pct >= 80 ? "Excellent! You're a polar science expert! 🌍" : pct >= 60 ? "Good job! Keep exploring polar science." : "Keep learning — try again to improve!"}
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={restart} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2942] px-4 py-2 text-sm font-medium text-white hover:bg-[#071A2B]">
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Close
          </button>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[current];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Question {current + 1} of {QUESTIONS.length}</span>
        <span className="text-sm font-semibold text-[#4DA8D8]">Score: {score}</span>
      </div>
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-[#4DA8D8] transition-all" style={{ width: `${((current) / QUESTIONS.length) * 100}%` }} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#071A2B]">{question.q}</h3>
      <div className="mt-4 space-y-2">
        {question.options.map((opt, idx) => {
          const isCorrect = idx === question.answer;
          const isSelected = idx === selected;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                answered
                  ? isCorrect
                    ? "border-green-500 bg-green-50 text-green-900"
                    : isSelected
                    ? "border-red-400 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground"
                  : "border-border bg-white text-foreground hover:border-[#4DA8D8]/50 hover:bg-secondary"
              }`}
            >
              <span>{opt}</span>
              {answered && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {answered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 rounded-lg border border-[#4DA8D8]/20 bg-[#4DA8D8]/5 p-3 text-sm text-foreground">
          <span className="font-semibold text-[#4DA8D8]">Explanation: </span>{question.explain}
        </div>
      )}

      {answered && (
        <button onClick={next} className="mt-4 w-full rounded-lg bg-[#0B2942] py-2.5 text-sm font-medium text-white hover:bg-[#071A2B]">
          {current + 1 < QUESTIONS.length ? "Next Question →" : "See Results →"}
        </button>
      )}
    </div>
  );
}