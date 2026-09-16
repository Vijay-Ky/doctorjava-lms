"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MOCK_TESTS, type MockTest, type AttemptResult } from "./testData";
import TestList from "./TestList";
import TestInstructions from "./TestInstructions";
import TestRunner from "./TestRunner";
import ResultsView from "./ResultsView";

type View = "list" | "instructions" | "running" | "results";

const HISTORY_KEY = "dj_mock_test_history";

export function loadHistory(): AttemptResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as AttemptResult[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: AttemptResult[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  } catch {
    /* storage unavailable — fail silently, in-memory state still works */
  }
}

export default function MockTestHub() {
  const [view, setView] = useState<View>("list");
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [lastResult, setLastResult] = useState<AttemptResult | null>(null);
  const [history, setHistory] = useState<AttemptResult[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleSelectTest = useCallback((test: MockTest) => {
    setActiveTest(test);
    setView("instructions");
  }, []);

  const handleStart = useCallback(() => {
    setView("running");
  }, []);

  const handleSubmit = useCallback((result: AttemptResult) => {
    setLastResult(result);
    setHistory((prev) => {
      const updated = [result, ...prev];
      saveHistory(updated);
      return updated;
    });
    setView("results");
  }, []);

  const handleRetake = useCallback(() => {
    setView("instructions");
  }, []);

  const handleBackToList = useCallback(() => {
    setActiveTest(null);
    setLastResult(null);
    setView("list");
  }, []);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <TestList tests={MOCK_TESTS} history={history} onSelect={handleSelectTest} />
          </motion.div>
        )}

        {view === "instructions" && activeTest && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <TestInstructions test={activeTest} onStart={handleStart} onBack={handleBackToList} />
          </motion.div>
        )}

        {view === "running" && activeTest && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <TestRunner test={activeTest} onSubmit={handleSubmit} />
          </motion.div>
        )}

        {view === "results" && activeTest && lastResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <ResultsView
              test={activeTest}
              result={lastResult}
              onRetake={handleRetake}
              onBackToList={handleBackToList}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
