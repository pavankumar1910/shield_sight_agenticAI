import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Key,
  Send,
  Copy,
  Check,
  Lock,
  MessageSquare,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { showToast } from '../ui/Toast';
import { askCopilot } from '../../services/api';
import type { PredictionResponse, ExplanationResponse } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isGrounded?: boolean;
}

interface RAGCopilotProps {
  prediction: PredictionResponse;
  explanation: ExplanationResponse | null;
  urlValidation?: any;
}

const PRESET_QUESTIONS = [
  "Why was this URL classified as phishing or legitimate?",
  "What are the top risk factors detected?",
  "Is the SSL certificate valid for this website?",
  "Is it safe for me to enter personal credentials on this page?"
];

export const RAGCopilot: React.FC<RAGCopilotProps> = ({
  prediction,
  explanation,
  urlValidation
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('shieldsight_openai_api_key') || '';
  });
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isEditingKey, setIsEditingKey] = useState<boolean>(!apiKey);
  const [tempKey, setTempKey] = useState<string>(apiKey);
  
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Reset messages when URL changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: `Hello! I am your RAG Security Copilot. I have indexed the security scan report for **${prediction.url}**.\n\nAsk me any questions specifically about this URL's safety, risk factors, or technical scan results. I am strictly grounded in this report and will not answer off-topic questions.`,
        timestamp: new Date(),
        isGrounded: true
      }
    ]);
  }, [prediction.url]);

  const handleSaveKey = () => {
    const trimmed = tempKey.trim();
    if (!trimmed) {
      showToast('error', 'Please enter a valid OpenAI API key.');
      return;
    }
    setApiKey(trimmed);
    localStorage.setItem('shieldsight_openai_api_key', trimmed);
    setIsEditingKey(false);
    showToast('success', 'OpenAI API key saved locally.');
  };

  const handleClearKey = () => {
    setApiKey('');
    setTempKey('');
    localStorage.removeItem('shieldsight_openai_api_key');
    setIsEditingKey(true);
    showToast('info', 'OpenAI API key removed.');
  };

  const handleSendQuestion = async (queryText?: string) => {
    const textToSend = (queryText || question).trim();

    if (!textToSend) return;

    if (!apiKey) {
      showToast('error', 'Please configure your OpenAI API Key first.');
      setIsEditingKey(true);
      return;
    }

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setQuestion('');
    setLoading(true);

    try {
      const response = await askCopilot({
        api_key: apiKey,
        url: prediction.url,
        question: textToSend,
        prediction,
        explanation,
        validation_issues: urlValidation?.issues || []
      });

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date(),
        isGrounded: response.grounded
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('Copilot request failed:', error);
      const errorDetail = error.response?.data?.detail || 'Failed to generate response. Please verify your API Key.';
      showToast('error', errorDetail);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Error**: ${errorDetail}`,
          timestamp: new Date(),
          isGrounded: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      showToast('success', 'Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <Card className="glass border-2 border-primary/30 shadow-2xl overflow-hidden rounded-2xl">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 p-6 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-heading text-foreground">
                  RAG AI Security Copilot
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                  <Sparkles className="w-3 h-3" /> Grounded RAG
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Interactive assistant trained strictly on this URL's report context
              </p>
            </div>
          </div>

          {/* KEY STATUS BADGE / BUTTON */}
          <div className="flex items-center gap-2">
            {apiKey && !isEditingKey ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>API Key Set</span>
                <button
                  onClick={() => setIsEditingKey(true)}
                  className="ml-2 hover:underline text-muted-foreground text-[11px]"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg text-xs font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Key Required</span>
              </div>
            )}
          </div>
        </div>

        {/* API KEY CONFIGURATION MODAL / CARD */}
        <AnimatePresence>
          {isEditingKey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/40"
            >
              <div className="bg-background/80 backdrop-blur-md p-4 rounded-xl border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Key className="w-4 h-4 text-primary" />
                  <span>Configure OpenAI API Key</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    (Stored only in your browser's local storage)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      className="pr-10 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveKey}
                      className="bg-primary text-white text-xs px-4"
                    >
                      Save Key
                    </Button>
                    {apiKey && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClearKey}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RAG GROUNDING BOUNDARY NOTICE */}
      <div className="bg-muted/40 px-6 py-2 border-b border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-blue-500" />
          <span>Strict RAG Scope: Answers are limited strictly to report findings for <strong>{prediction.url}</strong></span>
        </div>
        <span className="hidden md:inline text-[11px] text-muted-foreground/70">GPT-4o-mini powered</span>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <CardContent className="p-6">
        <div className="min-h-[280px] max-h-[420px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm relative group ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-muted/70 text-foreground border border-border/60 rounded-tl-none'
              }`}>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="absolute top-2 right-2 p-1 rounded-md bg-background/50 hover:bg-background text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}

                <div className="whitespace-pre-wrap font-sans">
                  {msg.text.split('\n\n').map((paragraph, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-foreground/10 text-[10px] opacity-70">
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.sender === 'assistant' && msg.isGrounded && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3 h-3" /> Report Grounded
                    </span>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-700 dark:bg-slate-800 flex items-center justify-center text-white flex-shrink-0 mt-1 font-bold text-xs">
                  You
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-muted/70 border border-border/60 rounded-2xl rounded-tl-none p-4 text-xs flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Retrieving context & generating answer...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* PRESET QUESTION BADGES */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <p className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Suggested Report Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSendQuestion(q)}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border/50 transition-all text-left disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion();
          }}
          className="mt-4 flex gap-2"
        >
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              apiKey
                ? "Ask a question about this URL's report..."
                : "Please configure your OpenAI API Key above first..."
            }
            disabled={loading || (!apiKey && !isEditingKey)}
            className="text-xs"
          />
          <Button
            type="submit"
            disabled={loading || !question.trim() || !apiKey}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 px-5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-semibold">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
