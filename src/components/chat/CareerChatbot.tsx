'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Code2,
  Maximize2,
  Minimize2,
  Copy,
  Check,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { useUserProfile } from '@/components/user/UserContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  'What is Python?',
  'Explain React hooks with an example',
  'What is the difference between SQL and MongoDB?',
  'How can I improve my resume for a software developer role?',
];

function CodeBlock({ language, code }: { language?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore if clipboard API is restricted
    }
  };

  return (
    <div className="my-2.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] sm:text-xs overflow-hidden border border-slate-700/60 shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/50 text-[10px] sm:text-[11px] text-slate-400 font-sans">
        <span className="uppercase tracking-wider font-semibold">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-700/50"
          title={copied ? 'Copied to clipboard' : 'Copy code'}
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code snippet'}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto whitespace-pre leading-relaxed">{code}</pre>
    </div>
  );
}

function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700/80 font-mono text-[11px] text-blue-600 dark:text-blue-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function FormattedAssistantMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code_${i}`}
            language={codeLanguage}
            code={codeBlockLines.join('\n')}
          />
        );
        codeBlockLines = [];
        inCodeBlock = false;
        codeLanguage = '';
      } else {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3_${i}`} className="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h2_${i}`} className="font-bold text-base text-slate-900 dark:text-white mt-2.5 mb-1">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`h1_${i}`} className="font-bold text-lg text-slate-900 dark:text-white mt-3 mb-1">
          {line.slice(2)}
        </h2>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={`li_${i}`} className="ml-4 list-disc text-xs leading-relaxed my-0.5">
          {renderInlineFormatting(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+\.)\s(.*)/);
      elements.push(
        <div key={`num_${i}`} className="ml-2 text-xs leading-relaxed my-0.5 flex gap-1.5">
          <span className="font-bold shrink-0">{match ? match[1] : ''}</span>
          <span>{renderInlineFormatting(match ? match[2] : line)}</span>
        </div>
      );
    } else if (line.trim().length === 0) {
      elements.push(<div key={`sp_${i}`} className="h-1.5" />);
    } else {
      elements.push(
        <p key={`p_${i}`} className="text-xs leading-relaxed my-1">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  }

  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <CodeBlock
        key="code_end"
        language={codeLanguage}
        code={codeBlockLines.join('\n')}
      />
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export function CareerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am your AI assistant in Smart Resume AI. You can ask me anything from programming, React, Python, or SQL, to writing, interview prep, and resume optimization. What would you like to explore?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { targetJob, resumeData } = useResume();
  const { user } = useUserProfile();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, loading, isFullScreen]);

  // Handle Escape key to exit full screen or close chat
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullScreen]);

  // Prevent background scroll when in full screen mode
  useEffect(() => {
    if (isFullScreen && isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullScreen, isOpen]);

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }, 60);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setError(null);
    setLastFailedMessage(null);

    // If retrying the last message, don't duplicate it in UI
    const lastMsg = messages[messages.length - 1];
    const isRetrying = Boolean(textToSend && lastMsg && lastMsg.role === 'user' && lastMsg.content === text);

    if (!isRetrying) {
      const userMsg: Message = {
        id: `usr_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const context = {
        jobTitle: targetJob?.title || undefined,
        company: targetJob?.company || undefined,
        jobDescription: targetJob?.description ? targetJob.description.substring(0, 500) : undefined,
        resumeSnippet: resumeData?.summary || undefined,
      };

      // Exclude welcome/greeting messages so multi-turn starts with user
      const history = messages
        .filter((m) => !m.id.startsWith('welcome'))
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          context,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Chat request failed with status ${res.status}`);
      }

      if (!data.reply) {
        throw new Error('Received an empty answer from the AI model.');
      }

      const assistantMsg: Message = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        provider: data.provider,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLastFailedMessage(text);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content:
          "Conversation reset. What question or topic would you like to explore next?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
    setLastFailedMessage(null);
  };

  return (
    <>
      {/* Floating Launcher Trigger */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 no-print">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 sm:gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all border border-slate-700/60 cursor-pointer group"
            aria-label="Open AI Assistant"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide hidden xs:inline sm:inline">AI Assistant</span>
          </button>
        )}
      </div>

      {/* Chat Window: Windowed vs Full Screen */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Smart Resume AI Assistant"
          aria-modal={isFullScreen}
          className={
            isFullScreen
              ? 'fixed inset-0 z-50 w-screen h-[100dvh] max-h-[100dvh] bg-white dark:bg-[#0F172A] flex flex-col overflow-hidden no-print transition-all duration-200 ease-in-out'
              : 'fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[460px] max-w-[calc(100vw-16px)] sm:max-w-none h-[560px] sm:h-[620px] max-h-[calc(100dvh-16px)] sm:max-h-[85vh] rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden no-print animate-in fade-in slide-in-from-bottom-4 duration-200'
          }
        >
          {/* Header */}
          <div className="shrink-0 px-4 py-3 sm:px-6 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
            <div className={`flex items-center justify-between ${isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-none">
                    Smart Resume AI Assistant
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 inline-block">
                    {isFullScreen ? 'Full Screen View' : 'AI Assistant'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={toggleFullScreen}
                  title={isFullScreen ? 'Exit full screen (Esc)' : 'Expand to full screen'}
                  aria-label={isFullScreen ? 'Exit full screen mode' : 'Expand chat to full screen'}
                  aria-expanded={isFullScreen}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFullScreen(false);
                    setIsOpen(false);
                  }}
                  title="Close chat"
                  aria-label="Close chat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:px-6 space-y-3.5 text-xs sm:text-sm">
            <div className={`space-y-3.5 ${isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-xs'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <FormattedAssistantMessage content={m.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}

                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px] sm:text-[10px] opacity-70">
                      <span>{m.timestamp}</span>
                      {m.provider && <span className="font-mono text-[9px]">{m.provider}</span>}
                    </div>
                  </div>

                  {m.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Generating response...</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                  {lastFailedMessage && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleSend(lastFailedMessage)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Starter Prompt Chips */}
          {messages.length <= 2 && (
            <div className="shrink-0 px-4 py-2 sm:px-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
              <div className={isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Suggested Questions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="shrink-0 p-3 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className={isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about programming, general knowledge, or resumes..."
                  maxLength={2000}
                  disabled={loading}
                  className="flex-1 h-10 px-3 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="h-10 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
