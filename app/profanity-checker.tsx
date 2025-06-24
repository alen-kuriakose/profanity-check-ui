"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Search, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { checkProfanity, verifyWithLLM } from "@/lib/api";

export default function ProfanityChecker() {
  const [inputWord, setInputWord] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [llmResult, setLlmResult] = useState<any>(null);
  const [llmLoading, setLlmLoading] = useState(false);

  const handleCheck = async () => {
    if (!inputWord.trim()) {
      setError("Please enter a word to check");
      return;
    }
    setIsLoading(true);
    setError("");
    setResult(null);
    setLlmResult(null);
    try {
      const response = await checkProfanity(inputWord.trim());
      setResult(response);
    } catch (err) {
      setError("Failed to check word. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLLMVerify = async () => {
    setLlmLoading(true);
    setError("");
    setLlmResult(null);
    try {
      const response = await verifyWithLLM(inputWord.trim());
      setLlmResult(response);
    } catch (err) {
      setError("Failed to verify with LLM. Please try again.");
    } finally {
      setLlmLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  const resetCheck = () => {
    setInputWord("");
    setResult(null);
    setLlmResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Profanity Checker</h1>
          <p className="text-slate-600">Check if a word contains profane content</p>
        </div>
        <Card className="rounded-xl shadow-lg border border-slate-200">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="word-input">Enter word to check</Label>
                <Input
                  id="word-input"
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a word..."
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={handleCheck}
                  disabled={isLoading || !inputWord.trim()}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Checking...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" /> Check Word
                    </>
                  )}
                </Button>
                {(result || error) && (
                  <Button
                    variant="outline"
                    onClick={resetCheck}
                    className="px-4"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {result && (
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {result.isProfane ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Profane Content Detected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Clean Content</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Category:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.isProfane
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {result.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Confidence:</span>
                      <span className="text-slate-900 font-medium">
                        {typeof result?.confidence === "number" && !isNaN(result.confidence)
                          ? result.confidence.toFixed(1)
                          : "0.0"}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="default"
                    onClick={handleLLMVerify}
                    disabled={llmLoading}
                    className="w-full"
                  >
                    {llmLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying with LLM...
                      </>
                    ) : (
                      <>Verify with LLM</>
                    )}
                  </Button>
                  {llmResult && (
                    <div className="bg-slate-100 rounded-lg p-4 mt-2 space-y-2 border border-slate-200">
                      <div className="flex items-center gap-2">
                        {llmResult.isProfane ? (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        <span className={llmResult.isProfane ? "text-red-700" : "text-green-700"}>
                          {llmResult.isProfane ? "Profane (LLM)" : "Clean (LLM)"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Category:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          llmResult.isProfane
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {llmResult.category}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Confidence:</span>
                        <span className="text-slate-900 font-medium">
                          {typeof llmResult?.confidence === "number" && !isNaN(llmResult.confidence)
                            ? llmResult.confidence.toFixed(1)
                            : "0.0"}%
                        </span>
                      </div>
                      <div className="flex flex-col  items-start">
                        <span className="text-sm font-medium text-slate-600 pb-1">Reason:</span>
                        <span className="text-slate-900 font-medium">
                          {(llmResult.reasoning)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="text-center mt-6 text-sm text-slate-500">
          Enter any word to check for profane content
        </div>
      </div>
    </div>
  );
}
