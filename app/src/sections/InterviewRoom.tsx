import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Socket } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
  Terminal,
  Code2,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useProctoring } from '../hooks/useProctoring';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import type { Session, Problem, CodeExecutionResult, InterviewMessage, Verdict } from '../types/index';
import AIAvatar from '../components/AIAvatar';

interface InterviewRoomProps {
  session: Session;
  socket: Socket;
  token: string;
  onEnd: (verdict?: Verdict) => void;
}

export default function InterviewRoom({ session, socket, token, onEnd }: InterviewRoomProps) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [messages, setMessages] = useState<InterviewMessage[]>(
    (session.chatHistory || []).map((m, i) => ({
      id: `init-${i}`,
      role: m.role as 'interviewer' | 'candidate',
      content: m.content,
      timestamp: new Date(m.timestamp).getTime()
    }))
  );
  const [inputMessage, setInputMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<CodeExecutionResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [state, setState] = useState(session.state);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [problemIndex, setProblemIndex] = useState(session.currentProblemIndex ?? 0);
  const [totalProblems, setTotalProblems] = useState(session.problemQueue?.length ?? 1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  // Voice Interaction
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const recordingRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync Voice Input and handle Binary Streaming
  useEffect(() => {
    if (transcript && isListening) {
      setInputMessage(transcript);
      // Also emit transcript update for live analysis (MVP)
      socket.emit('audio_data', {
        sessionId: session.sessionId,
        chunk: null, // Binary chunk logic below
        transcript: transcript
      });
    }
  }, [transcript, isListening, socket, session.sessionId]);

  // Authorities: Start binary streaming when listening
  useEffect(() => {
    const startStreaming = async () => {
      if (isListening) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const recorder = new MediaRecorder(stream);
          recordingRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              e.data.arrayBuffer().then(buffer => {
                socket.emit('audio_data', {
                  sessionId: session.sessionId,
                  chunk: buffer
                });
              });
            }
          };

          recorder.start(300); // 300ms chunks
        } catch (err) {
          console.error("Mic access failed", err);
        }
      } else {
        recordingRef.current?.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
      }
    };

    startStreaming();
  }, [isListening, socket, session.sessionId]);

  // Auto-speak new interviewer messages
  useEffect(() => {
    if (messages.length > 0 && voiceEnabled) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'interviewer') {
        speak(lastMsg.content, session.interviewerPersona);
      }
    }
  }, [messages, voiceEnabled, session.interviewerPersona, speak]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch problem details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(`${API_URL}/api/problems/${session.problemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const prob = await response.json();
          setProblem(prob);
          setCode(prob.starterCode[language] || prob.starterCode.javascript);
        }
      } catch (error) {
        console.error('Failed to fetch problem:', error);
      }
    };

    fetchProblem();
  }, [session.problemId, token, language]);

  // Activate Proctoring
  useProctoring({
    socket,
    sessionId: session.sessionId,
    active: state !== 'VERDICT' && state !== 'ARCHIVED'
  });

  // Socket event handlers
  useEffect(() => {
    socket.on('interview_joined', (data) => {
      console.log('Joined interview:', data.sessionId);
    });

    socket.on('interviewer_message', (data) => {
      setIsThinking(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'interviewer',
        content: data.message,
        timestamp: Date.now()
      }]);
    });

    socket.on('state_changed', (data) => {
      setState(data.state);
    });

    socket.on('run_result', (result) => {
      setRunResult(result);
      setShowResults(true);
      setIsRunning(false);
    });

    socket.on('verdict_ready', (verdict) => {
      onEnd(verdict);
    });

    socket.on('pressure_trigger', (action) => {
      setIsThinking(false);
      if (action.message) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'interviewer',
          content: action.message,
          timestamp: Date.now()
        }]);
      }
    });

    socket.on('next_problem', (data) => {
      setProblem(data.problem);
      setCode(data.problem.starterCode[language] || data.problem.starterCode.javascript);
      setProblemIndex(data.currentProblemIndex);
      setTotalProblems(data.totalProblems);
      setIsSubmitting(false);
      setRunResult(null);
      setShowResults(false);
      // Optional: Add a system message about the next problem
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'interviewer',
        content: `Great job on the last one. Now, let's look at "${data.problem.title}".`,
        timestamp: Date.now()
      }]);
    });

    socket.on('behavioral_update', (data: any) => {
      setBehavioralData(data);
      // Abrupt Termination check
      if (data.interruptionType === 'TERMINATE' || data.isEarlyTermination) {
        setMessages(prev => [...prev, {
          id: 'abrupt-end',
          role: 'interviewer',
          content: "This interview session has reached an early conclusion based on critical disqualification signals. Your performance data has been categorized.",
          timestamp: Date.now()
        }]);
        setTimeout(() => onEnd(), 3000);
      }
    });

    socket.on('INTERRUPT', (data) => {
      console.log(`[Interrupt] Authority logic fired: ${data.reason}`);
      setIsThinking(false);
      stopListening(); // Immediate Mic Cut
      setVoiceEnabled(true); // Ensure interviewer can be heard
    });

    socket.on('error', (data) => {
      setIsSubmitting(false);
      setIsRunning(false);
      // Using alert for now, could be a toast
      alert(data.message || 'An error occurred');
    });

    // ... rest of the cleanup
    return () => {
      window.speechSynthesis.cancel();
      socket.off('interview_joined');
      socket.off('interviewer_message');
      socket.off('state_changed');
      socket.off('run_result');
      socket.off('verdict_ready');
      socket.off('pressure_trigger');
      socket.off('behavioral_update');
      socket.off('error');
    };
  }, [socket, problem, onEnd]);

  // Behavioral HUD state
  const [behavioralData, setBehavioralData] = useState({
    stress: 0,
    dnaMatch: 50,
    emotionalState: 'Calm/Focused'
  });

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      socket.emit('heartbeat', { sessionId: session.sessionId });
    }, 5000);

    return () => clearInterval(interval);
  }, [socket, session.sessionId]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      socket.emit('code_update', {
        sessionId: session.sessionId,
        code: value,
        cursorPosition: editorRef.current?.getPosition()
      });
    }
  }, [socket, session.sessionId]);

  const handleRun = () => {
    setIsRunning(true);
    setShowResults(true);
    socket.emit('run_code', {
      sessionId: session.sessionId,
      code,
      language
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    socket.emit('submit_solution', {
      sessionId: session.sessionId,
      code
    });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'candidate',
      content: inputMessage,
      timestamp: Date.now()
    }]);

    socket.emit('request_explanation', {
      sessionId: session.sessionId,
      context: inputMessage
    });

    setIsThinking(true);
    setInputMessage('');
    resetTranscript(); // Clear speech buffer logic
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = (s: string) => {
    switch (s) {
      case 'CODING': return 'text-[#30D8A8]';
      case 'INTERRUPTION': return 'text-yellow-400';
      case 'VERDICT': return 'text-blue-400';
      default: return 'text-white/60';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#07080A]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#07080A]/95 backdrop-blur z-10">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#30D8A8] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-[#07080A]" />
              </div>
              <span className="font-display font-bold">HireCheck</span>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div>
              <h1 className="font-medium">{problem?.title || 'Loading...'}</h1>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className={problem?.difficulty === 'easy' ? 'text-green-400' : problem?.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'}>
                  {problem?.difficulty}
                </span>
                <span>•</span>
                <span>{problem?.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-white/50" />
              <span className="font-mono">{formatTime(timer)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${getStateColor(state).replace('text-', 'bg-')}`} />
              <span className={getStateColor(state)}>{state}</span>
              {session.totalRounds > 1 && (
                <span className="text-white/40 font-mono ml-2">
                  ROUND {session.currentRound}/{session.totalRounds}
                </span>
              )}
            </div>

            <button
              onClick={() => setShowEndConfirm(true)}
              className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
            >
              End Interview
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal">

          {/* Left Panel - Problem & Chat */}
          <Panel defaultSize={session.interviewMode === 'behavioral' ? 50 : 35} minSize={25} className="flex flex-col">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="h-full flex flex-col p-4 gap-4"
            >
              {/* Problem Description */}
              <div className="flex-[1.5] min-h-0 flex flex-col card-clinical glass overflow-hidden">
                <div className="p-4 pb-2 border-b border-white/5 flex-shrink-0">
                  <h2 className="font-display font-semibold flex items-center gap-2">
                    <AlertCircle className={`w-5 h-5 ${session.interviewMode === 'compass' ? 'text-blue-400' : 'text-[#30D8A8]'}`} />
                    {session.interviewMode === 'compass' ? 'Security Briefing Dossier' : 'Problem'}
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-3 custom-scrollbar">
                  <div className="mb-6">
                    <div className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed">
                      {problem?.description || 'Loading problem...'}
                    </div>
                    {session.metadata?.activeConstraint && (
                      <div className="mt-4 p-3 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
                        <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1">Expert Constraint Active</div>
                        <div className="text-xs text-yellow-200 italic font-medium">"{session.metadata?.activeConstraint}"</div>
                      </div>
                    )}
                  </div>

                  {problem?.testCases && (
                    <div className="mb-6">
                      <h3 className="font-medium mb-3 text-sm text-white/50">Example Test Cases</h3>
                      <div className="space-y-3">
                        {problem.testCases.slice(0, 2).map((tc, i) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3 text-sm">
                            <div className="text-white/50 mb-1">Input:</div>
                            <div className="font-mono text-white/70 mb-2">{tc.input}</div>
                            <div className="text-white/50 mb-1">Output:</div>
                            <div className="font-mono text-[#30D8A8]">{tc.output}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat */}
              <div className="flex-1 min-h-0 flex flex-col card-clinical glass overflow-hidden">
                <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#30D8A8]" />
                    <span className="text-sm font-bold tracking-tight">{session.interviewerPersona || 'Interviewer'} Chat</span>
                  </div>
                  {session.interviewMode && (
                    <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#30D8A8]/10 text-[#30D8A8] border border-[#30D8A8]/20 flex items-center gap-2">
                      {session.interviewMode}
                    </div>
                  )}
                  {/* Voice Toggle */}
                  <button
                    onClick={() => {
                      if (isSpeaking) stopSpeaking();
                      setVoiceEnabled(!voiceEnabled);
                    }}
                    className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${voiceEnabled ? 'bg-[#30D8A8]/10 text-[#30D8A8]' : 'text-white/40 hover:text-white'}`}
                    title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
                  >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>

                <PanelGroup orientation="vertical" className="flex-1 flex flex-col min-h-0">
                  {/* AI Avatar Panel - Resizable */}
                  <Panel defaultSize={15} minSize={0} collapsible className="flex flex-col bg-white/[0.01] border-b border-white/5 relative group">
                    <div className="flex-1 flex justify-center py-1 overflow-hidden min-h-0">
                      <div className="relative h-full aspect-square">
                        <AIAvatar
                          persona={session.interviewerPersona as 'Karan' | 'Priya' || 'Karan'}
                          isThinking={isThinking}
                          isSpeaking={isSpeaking}
                          isSimple={true}
                          liveStats={behavioralData}
                        />
                      </div>
                    </div>
                  </Panel>

                  <PanelResizeHandle className="h-1 bg-transparent hover:bg-[#30D8A8]/30 transition-colors cursor-row-resize flex items-center justify-center group/resize">
                    <div className="h-px w-8 bg-white/5 group-hover/resize:bg-[#30D8A8]/50 transition-colors" />
                  </PanelResizeHandle>

                  {/* Message List Panel */}
                  <Panel defaultSize={85} minSize={20} className="flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                          const isCandidate = msg.role === 'candidate';
                          const bubbleClass = isCandidate
                            ? 'bg-[#30D8A8]/20 text-[#30D8A8] rounded-br-md'
                            : 'bg-white/5 text-white rounded-bl-md shadow-lg shadow-black/20';

                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={`flex ${isCandidate ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${bubbleClass}`}>
                                {msg.content}
                              </div>
                            </motion.div>
                          );
                        })}
                        {isThinking && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex justify-start mb-4"
                          >
                            <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-2">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-2 h-2 rounded-full bg-[#30D8A8]"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                className="w-2 h-2 rounded-full bg-[#30D8A8]/60"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                                className="w-2 h-2 rounded-full bg-[#30D8A8]/30"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  </Panel>
                </PanelGroup>

                <div className="p-3 border-t border-white/5 bg-white/[0.01] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!isSupported) {
                          alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
                          return;
                        }
                        isListening ? stopListening() : startListening();
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                      title={!isSupported ? 'Speech not supported' : isListening ? 'Stop Listening' : 'Start Listening'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 relative">
                      {isListening && transcript && (
                        <div className="absolute -top-8 left-0 right-0 px-3 py-1 bg-[#30D8A8]/10 border border-[#30D8A8]/20 rounded-t-lg backdrop-blur-sm">
                          <span className="text-[10px] text-[#30D8A8] font-mono truncate block">
                            Live: {transcript}
                          </span>
                        </div>
                      )}
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isListening ? "Listening..." : "Type or speak your response..."}
                        className={`w-full px-4 py-2 bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#30D8A8]/50 ${isListening ? 'rounded-b-full rounded-t-none' : 'rounded-full'}`}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      className="w-10 h-10 rounded-full bg-[#30D8A8] flex items-center justify-center text-[#07080A] hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </Panel>

          {/* Right Panel - Editor (Hidden or Small in Behavioral Mode) */}
          {session.interviewMode !== 'behavioral' ? (
            <>
              <PanelResizeHandle className="w-1 bg-transparent hover:bg-[#30D8A8]/50 transition-colors cursor-col-resize flex items-center justify-center group">
                <div className="w-px h-8 bg-white/10 group-hover:bg-[#30D8A8] transition-colors" />
              </PanelResizeHandle>
              <Panel className="flex flex-col">
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="h-full flex flex-col p-4 pl-0"
                >
                  <div className="flex-1 flex flex-col card-clinical glass overflow-hidden">
                    {/* Editor Toolbar */}
                    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#30D8A8]/50"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCode(problem?.starterCode[language] || '')}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/60 hover:bg-white/5 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 min-h-0">
                      <Editor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={handleCodeChange}
                        onMount={(editor) => { editorRef.current = editor; }}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          padding: { top: 16 },
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      />
                    </div>

                    {/* Bottom Panel - Results & Actions */}
                    <div className="border-t border-white/5">
                      {/* Results */}
                      {showResults && runResult && (
                        <div className="border-b border-white/5">
                          <div className="flex items-center justify-between px-4 py-2 bg-white/5">
                            <div className="flex items-center gap-2">
                              <Terminal className="w-4 h-4 text-white/50" />
                              <span className="text-sm font-medium">Output</span>
                            </div>
                            <button
                              onClick={() => setShowResults(false)}
                              className="text-white/50 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4 font-mono text-sm max-h-[150px] overflow-y-auto custom-scrollbar">
                            {runResult.status === 'success' ? (
                              <div className="text-green-400">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Execution successful</span>
                                </div>
                                {runResult.output && (
                                  <pre className="bg-white/5 p-3 rounded-lg text-white/70 whitespace-pre-wrap">{runResult.output}</pre>
                                )}
                              </div>
                            ) : (
                              <div className="text-red-400">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Execution failed</span>
                                </div>
                                {runResult.error && (
                                  <pre className="bg-red-500/10 p-3 rounded-lg whitespace-pre-wrap">{runResult.error}</pre>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                          >
                            {isRunning ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            Run
                          </button>
                        </div>

                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#30D8A8] text-[#07080A] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-[#07080A] border-t-transparent rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              {session.interviewMode === 'marathon' && (problemIndex < totalProblems - 1)
                                ? 'Submit & Next Problem'
                                : 'Submit Solution'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Panel>
            </>
          ) : (
            <div className="flex-1 flex flex-col p-8 items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-[#30D8A8]/10 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-[#30D8A8]" />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter">BEHAVIORAL FOCUS</h2>
              <p className="max-w-md text-white/40 text-sm leading-relaxed">
                You are currently in a behavioral-first interview. Karan is evaluating your leadership,
                conflict resolution, and cultural fit. Focus on the STAR method in the chat.
              </p>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-[#30D8A8] text-[#07080A] font-bold hover:scale-105 transition-transform"
              >
                Finish Interview Cycle
              </button>
            </div>
          )}
        </PanelGroup>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="card-clinical p-6 max-w-md">
            <h3 className="font-display text-xl font-semibold mb-3">End Interview?</h3>
            <p className="text-white/60 mb-6">
              Are you sure you want to end this interview? Your progress will be saved,
              but you won't be able to resume.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-4 py-2 rounded-lg text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onEnd()}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
