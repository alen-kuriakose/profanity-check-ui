/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef } from "react";

import { Search, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  checkProfanity,
  verifyWithLLM,
  checkProfanityTransformer,
  detectLanguage,
} from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { log } from "console";
// import { Toggle } from "@/components/ui/toggle";

const TABS = [
  { label: "Profanity Check (FastText)", key: "fasttext" },
  { label: "Profanity Check (Transformer, English/Indic)", key: "transformer" },
];

export default function ProfanityChecker() {
  // Ref for debounce timeout
  const langDetectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState("transformer");
  const [inputWord, setInputWord] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [llmResult, setLlmResult] = useState<any>(null);
  const [llmLoading, setLlmLoading] = useState(false);

  // Transformer tab state
  const [transformerResult, setTransformerResult] = useState<any>(null);
  const [transformerLoading, setTransformerLoading] = useState(false);
  const [langDetectEnabled, setLangDetectEnabled] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<
    "english" | "indic" | ""
  >("");
  const [selectedLanguage, setSelectedLanguage] = useState<
    "english" | "indic" | ""
  >("");
  const [langDetectLoading, setLangDetectLoading] = useState(false);

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

  const handleTransformerCheck = async () => {
    if (!inputWord.trim()) {
      setError("Please enter a word to check");
      return;
    }
    setTransformerLoading(true);
    setError("");
    setLlmResult(null);
    setTransformerResult(null);
    try {
      let lang: "english" | "indic" | undefined = selectedLanguage || undefined;
      if (langDetectEnabled && detectedLanguage) {
        lang = detectedLanguage;
      }
      const response = await checkProfanityTransformer(inputWord.trim(), lang);
      setTransformerResult(response);
    } catch (err) {
      setError("Failed to check with transformer. Please try again.");
    } finally {
      setTransformerLoading(false);
    }
  };

  const handleDetectLanguage = async (words: string) => {
    setLangDetectLoading(true);
    setError("");
    setDetectedLanguage("");
    try {
      const data = await detectLanguage(words.trim());
      if (
        data.detected_language === "english" ||
        data.detected_language === "indic"
      ) {
        setDetectedLanguage(data.raw);
        setSelectedLanguage(data.detected_language);
      } else {
        setDetectedLanguage("");
      }
    } catch (err) {
      setError("Failed to detect language. Please try again.");
    } finally {
      setLangDetectLoading(false);
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
      if (activeTab === "fasttext") handleCheck();
      else if (activeTab === "transformer") handleTransformerCheck();
    }
  };

  const resetCheck = () => {
    setInputWord("");
    setResult(null);
    setLlmResult(null);
    setError("");
    setTransformerResult(null);
    setDetectedLanguage("");
    setSelectedLanguage("");
    setLangDetectEnabled(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Profanity Checker
          </h1>
          <p className="text-slate-600">
            Check if a sentence or phrase contains profane content
          </p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            resetCheck();
          }}
          className="w-full"
        >
          <TabsList className="flex flex-col md:flex-row gap-2 justify bg-gray-200/50 ">
            <TabsTrigger value="transformer">
              Transformer, English/Indic
            </TabsTrigger>
            <TabsTrigger value="fasttext" className="w-full">
              FastText, English
            </TabsTrigger>
          </TabsList>
          <Card className="rounded-xl shadow-lg border border-slate-200">
            <CardContent className="p-6 space-y-6">
              <TabsContent value="fasttext">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="word-input">
                      Enter sentence or phrase to check
                    </Label>
                    <Input
                      id="word-input"
                      type="text"
                      value={inputWord}
                      onChange={(e) => {
                        setInputWord(e.target.value);
                      }}
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
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Checking...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" /> Check Profanity
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
                  {result && (
                    <div className="border-t border-slate-200 pt-6 space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {result.isProfane ? (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-medium">
                                Profane Content Detected
                              </span>
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
                            <span className="text-sm font-medium text-slate-600">
                              Category:
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                result.isProfane
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {result.category}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">
                              Confidence:
                            </span>
                            <span className="text-slate-900 font-medium">
                              {typeof result?.confidence === "number" &&
                              !isNaN(result.confidence)
                                ? result.confidence.toFixed(1)
                                : "0.0"}
                              %
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
                              <Loader2 className="w-4 h-4 animate-spin" />{" "}
                              Verifying with LLM...
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
                              <span
                                className={
                                  llmResult.isProfane
                                    ? "text-red-700"
                                    : "text-green-700"
                                }
                              >
                                {llmResult.isProfane
                                  ? "Profane (LLM)"
                                  : "Clean (LLM)"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-600">
                                Category:
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  llmResult.isProfane
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {llmResult.category}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-600">
                                Confidence:
                              </span>
                              <span className="text-slate-900 font-medium">
                                {typeof llmResult?.confidence === "number" &&
                                !isNaN(llmResult.confidence)
                                  ? llmResult.confidence.toFixed(1)
                                  : "0.0"}
                                %
                              </span>
                            </div>
                            <div className="flex flex-col  items-start">
                              <span className="text-sm font-medium text-slate-600 pb-1">
                                Reason:
                              </span>
                              <span className="text-slate-900 font-medium">
                                {llmResult.reasoning}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="transformer">
                <div className="space-y-4 ">
                  <div className="flex flex-col md:flex-row md:items-center items-start gap-3  justify-between">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center ">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="lang-detect-checkbox"
                          checked={langDetectEnabled}
                          onChange={(e) => {
                            setLangDetectEnabled(e.target.checked);
                            if (!e.target.checked) {
                              setDetectedLanguage("");
                            } else if (inputWord.trim().length >= 5) {
                              console.log("Detecting language...", inputWord);

                              handleDetectLanguage(inputWord);
                            }
                          }}
                          className="accent-blue-600 w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <Label
                          htmlFor="lang-detect-checkbox"
                          className="cursor-pointer select-none"
                        >
                          Detect Language
                          {langDetectEnabled && (
                            <span className=" text-xs text-slate-500">
                              (min 5 chars)
                            </span>
                          )}
                        </Label>
                      </div>

                      {langDetectLoading && (
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      )}
                      {langDetectEnabled && detectedLanguage && (
                        <span className="text-xs text-green-600">
                          Detected: {detectedLanguage}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Label htmlFor="language-select">Language:</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="min-w-[200px] h-8 justify-between"
                            id="language-select"
                            // disabled={langDetectEnabled && !!detectedLanguage}
                          >
                            {langDetectEnabled && detectedLanguage
                              ? detectedLanguage.charAt(0).toUpperCase() +
                                detectedLanguage.slice(1)
                              : selectedLanguage
                              ? selectedLanguage.charAt(0).toUpperCase() +
                                selectedLanguage.slice(1)
                              : "Select"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[200px]">
                          <DropdownMenuItem
                            onSelect={() => {
                              setLangDetectEnabled(false);
                              setSelectedLanguage("english");
                              setDetectedLanguage("english");
                            }}
                            // disabled={langDetectEnabled && !!detectedLanguage}
                          >
                            English
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setLangDetectEnabled(false);
                              setSelectedLanguage("indic");
                              setDetectedLanguage("indic");
                            }}
                            // disabled={langDetectEnabled && !!detectedLanguage}
                          >
                            Indic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="word-input-transformer">
                      Enter sentence or phrase to check
                    </Label>
                    <Input
                      id="word-input-transformer"
                      type="text"
                      value={inputWord}
                      onChange={(e) => {
                        setInputWord(e.target.value);
                        if (langDetectTimeout.current)
                          clearTimeout(langDetectTimeout.current);
                        if (
                          langDetectEnabled &&
                          e.target.value.trim().length >= 5
                        ) {
                          langDetectTimeout.current = setTimeout(() => {
                            handleDetectLanguage(e.target.value);
                          }, 500);
                        } else if (langDetectEnabled) {
                          console.log("sdgjas");

                          setDetectedLanguage("");
                        }
                      }}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a word..."
                      disabled={transformerLoading}
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
                      onClick={handleTransformerCheck}
                      disabled={
                        transformerLoading ||
                        !inputWord.trim() ||
                        (langDetectEnabled &&
                          !detectedLanguage &&
                          inputWord.trim().length < 5)
                      }
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {transformerLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Checking...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" /> Check Profanity
                        </>
                      )}
                    </Button>
                    {(transformerResult || error) && (
                      <Button
                        variant="outline"
                        onClick={resetCheck}
                        className="px-4"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {transformerResult && (
                    <div className="border-t border-slate-200 pt-6 space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {transformerResult.isProfane ? (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-medium">
                                Profane Content Detected
                              </span>
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
                            <span className="text-sm font-medium text-slate-600">
                              Category:
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                transformerResult.isProfane
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {transformerResult.category}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">
                              Confidence:
                            </span>
                            <span className="text-slate-900 font-medium">
                              {typeof transformerResult?.confidence ===
                                "number" && !isNaN(transformerResult.confidence)
                                ? transformerResult.confidence.toFixed(1)
                                : "0.0"}
                              %
                            </span>
                          </div>
                          {/* <div className="flex justify-between items-center"> */}
                          {/* <span className="text-sm font-medium text-slate-600">
                              Detected Language:
                            </span>
                            <span className="text-slate-900 font-medium">
                              {transformerResult.detected_language || "-"}
                            </span> */}
                          {/* </div> */}
                          {/* <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">
                              User Language:
                            </span>
                            <span className="text-slate-900 font-medium">
                              {transformerResult.user_language || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">
                              Language Match:
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                transformerResult.language_match === true
                                  ? "text-green-700"
                                  : transformerResult.language_match === false
                                  ? "text-red-700"
                                  : "text-slate-500"
                              }`}
                            >
                              {transformerResult.language_match === true
                                ? "Yes"
                                : transformerResult.language_match === false
                                ? "No"
                                : "-"}
                            </span>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-slate-600 pb-1">
                              Toxic Labels:
                            </span>
                            <span className="text-slate-900 font-medium">
                              {transformerResult.toxic_labels || "-"}
                            </span>
                          </div> */}
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
                              <Loader2 className="w-4 h-4 animate-spin" />{" "}
                              Verifying with LLM...
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
                              <span
                                className={
                                  llmResult.isProfane
                                    ? "text-red-700"
                                    : "text-green-700"
                                }
                              >
                                {llmResult.isProfane
                                  ? "Profane (LLM)"
                                  : "Clean (LLM)"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-600">
                                Category:
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  llmResult.isProfane
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {llmResult.category}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-600">
                                Confidence:
                              </span>
                              <span className="text-slate-900 font-medium">
                                {typeof llmResult?.confidence === "number" &&
                                !isNaN(llmResult.confidence)
                                  ? llmResult.confidence.toFixed(1)
                                  : "0.0"}
                                %
                              </span>
                            </div>
                            <div className="flex flex-col  items-start">
                              <span className="text-sm font-medium text-slate-600 pb-1">
                                Reason:
                              </span>
                              <span className="text-slate-900 font-medium">
                                {llmResult.reasoning}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
