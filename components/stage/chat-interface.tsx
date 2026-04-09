"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, X, FileText } from "lucide-react";

interface ChatMessage {
  id?: string;
  role: string;
  content: string;
  createdAt?: string;
}

interface ChatInterfaceProps {
  projectId: string;
  stageKey: string;
  initialMessages: ChatMessage[];
  stageColor: string;
}

const STAGE_SUGGESTIONS: Record<string, string[]> = {
  ideation: [
    "Help me brainstorm web3 startup ideas in DeFi",
    "What are the biggest unsolved problems in web3?",
    "Evaluate my idea: a decentralized freelance marketplace",
  ],
  validation: [
    "How do I validate if there's real demand for my idea?",
    "Who are my top 5 competitors and what are their weaknesses?",
    "Help me design a validation interview script",
  ],
  "stress-test": [
    "Run a full stress test on my startup idea",
    "What are the biggest risks I should be worried about?",
    "Score my idea across all 7 dimensions",
  ],
  "lean-canvas": [
    "Help me fill out my Lean Canvas starting with the problem",
    "What should my unique value proposition be?",
    "Identify my early adopters and channels",
  ],
  selection: [
    "Help me prioritize my feature list using the Kano model",
    "Which features are must-haves vs nice-to-haves?",
    "Create an effort-impact matrix for my features",
  ],
  mvp: [
    "Define the minimum viable product for my startup",
    "What's the smallest thing I can build to test my hypothesis?",
    "Set success criteria and timeline for my MVP",
  ],
  "mafia-offer": [
    "Help me craft an irresistible mafia offer",
    "What would make my first 100 users unable to say no?",
    "Design a compelling early-adopter incentive",
  ],
  build: [
    "Plan my 5-sprint build roadmap",
    "Break down Sprint 1 into actionable tasks",
    "What tech stack should I use for my MVP?",
  ],
  launch: [
    "Create a launch strategy for my web3 product",
    "What channels should I focus on for day-one traction?",
    "Design a referral loop for viral growth",
  ],
  feedback: [
    "Design a feedback collection system for my product",
    "What metrics should I track post-launch?",
    "Create a user interview template for feedback",
  ],
  pitch: [
    "Help me build a 10-slide investor pitch deck",
    "What's my traction story for investors?",
    "How much should I raise and at what valuation?",
  ],
  "token-launch": [
    "Design my token economics and distribution",
    "What vesting schedule works best for my project?",
    "Plan the mechanics of my token launch",
  ],
  decision: [
    "Review all my data and help me make a go/no-go decision",
    "What are the strongest arguments for and against proceeding?",
    "Generate a final recommendation based on all stages",
  ],
};

const EXTRACTION_MARKERS = [
  "LEAN_CANVAS_",
  "PITCH_",
  "MVP_",
  "TOKEN_",
  "DECISION_",
  "PROJECT_THESIS:",
  "FEEDBACK_",
];

const SCORE_DIMENSIONS = [
  "CLARITY:",
  "DESIRABILITY:",
  "VIABILITY:",
  "FEASIBILITY:",
  "MISSION:",
  "TIMING:",
  "DEFENSIBILITY:",
];

export function ChatInterface({
  projectId,
  stageKey,
  initialMessages,
  stageColor,
}: ChatInterfaceProps) {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedDoc, setAttachedDoc] = useState<{
    name: string;
    text: string;
    truncated: boolean;
  } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSentSeed = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const doSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);
      const userMessage: ChatMessage = {
        role: "user",
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsStreaming(true);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages([...newMessages, assistantMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            stageKey,
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error || `Request failed with status ${response.status}`,
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          accumulated += text;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: accumulated,
              createdAt: new Date().toISOString(),
            };
            return updated;
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        setMessages(newMessages);
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, projectId, stageKey],
  );

  // Auto-send seed message from URL param
  useEffect(() => {
    const seed = searchParams.get("seed");
    if (seed && !hasSentSeed.current && messages.length === 0) {
      hasSentSeed.current = true;
      doSend(seed);
    }
  }, [searchParams, messages.length, doSend]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected if needed
    e.target.value = "";

    setParseError(null);
    setIsParsing(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-document", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error ?? "Failed to parse document");
        return;
      }
      setAttachedDoc({ name: data.fileName, text: data.text, truncated: data.truncated });
    } catch {
      setParseError("Failed to upload document");
    } finally {
      setIsParsing(false);
    }
  };

  const sendMessage = async () => {
    let messageText = input;
    if (attachedDoc) {
      messageText = `[ATTACHED DOCUMENT: ${attachedDoc.name}]${attachedDoc.truncated ? " (truncated to 50,000 chars)" : ""}\n\n${attachedDoc.text}\n\n---\n\n${input}`;
      setAttachedDoc(null);
    }
    await doSend(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const retry = () => {
    if (messages.length > 0) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (lastUser) {
        setInput(lastUser.content);
        setMessages(messages.filter((m) => m !== lastUser));
        setError(null);
      }
    }
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, lineIdx) => {
      // Check for extraction markers or score dimensions
      const hasMarker =
        EXTRACTION_MARKERS.some((m) => line.includes(m)) ||
        SCORE_DIMENSIONS.some((m) => line.toUpperCase().includes(m));

      // Parse inline markdown: **bold** and `code`
      const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      const rendered = parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="bg-secondary px-1 py-0.5 rounded text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      });

      if (hasMarker) {
        return (
          <div
            key={lineIdx}
            className="my-1 px-2 py-1 rounded text-xs border-l-2"
            style={{
              borderColor: stageColor,
              backgroundColor: `${stageColor}08`,
            }}
          >
            {rendered}
          </div>
        );
      }

      return (
        <span key={lineIdx}>
          {rendered}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const suggestions = STAGE_SUGGESTIONS[stageKey] || [];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-slide-in">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-4"
              style={{ backgroundColor: `${stageColor}20`, color: stageColor }}
            >
              {stageKey.charAt(0).toUpperCase()}
            </div>
            <p className="text-lg font-medium text-foreground mb-1">
              Start the conversation
            </p>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Your AI co-founder is ready to help. Pick a suggestion or type
              your own message.
            </p>
            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2 max-w-md w-full">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => doSend(suggestion)}
                    className="text-left text-sm px-4 py-3 rounded-lg border border-border hover:border-foreground/20 hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-slide-in`}
          >
            <div className="max-w-[80%]">
              <div
                className={`rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-secondary text-foreground"
                    : "bg-card text-foreground"
                }`}
                style={
                  msg.role === "user"
                    ? { borderRight: `2px solid ${stageColor}` }
                    : { borderLeft: `2px solid ${stageColor}20` }
                }
              >
                {msg.content ? (
                  renderContent(msg.content)
                ) : isStreaming && i === messages.length - 1 ? (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        backgroundColor: stageColor,
                        animationDelay: "0ms",
                      }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        backgroundColor: stageColor,
                        animationDelay: "150ms",
                      }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        backgroundColor: stageColor,
                        animationDelay: "300ms",
                      }}
                    />
                  </span>
                ) : null}
              </div>
              {msg.createdAt && (
                <span className="text-[10px] text-muted-foreground mt-1 block px-1">
                  {formatTime(msg.createdAt)}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2">
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-2 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={retry}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 shrink-0">
        {/* Attached document badge */}
        {attachedDoc && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border"
              style={{ borderColor: `${stageColor}40`, backgroundColor: `${stageColor}10`, color: stageColor }}
            >
              <FileText className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[180px]">{attachedDoc.name}</span>
              {attachedDoc.truncated && <span className="opacity-60">(truncated)</span>}
              <button
                onClick={() => setAttachedDoc(null)}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        {/* Parse error */}
        {parseError && (
          <div className="flex items-center justify-between text-xs text-destructive mb-2 px-1">
            <span>{parseError}</span>
            <button onClick={() => setParseError(null)} className="opacity-60 hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* Paperclip button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-[44px] w-[44px] p-0 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || isParsing}
            title="Attach PDF, DOCX or TXT"
          >
            {isParsing ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
            className="min-h-[44px] max-h-[120px] resize-none bg-secondary"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={(!input.trim() && !attachedDoc) || isStreaming}
            size="sm"
            className="h-[44px] px-4"
            style={{ backgroundColor: stageColor, color: "#050505" }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
