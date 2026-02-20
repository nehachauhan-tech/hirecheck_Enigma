 import { useState, useEffect, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import LandingPage from './sections/LandingPage';
import Dashboard from './sections/Dashboard';
import InterviewRoom from './sections/InterviewRoom';
import VerdictReport from './sections/VerdictReport';
import InterviewSetup from './sections/InterviewSetup';
import AIDiagnostic from './sections/AIDiagnostic';
import CompanyCompass from './sections/CompanyCompass';
import ProgressAnalytics from './sections/ProgressAnalytics';
import AuthModal from './components/AuthModal';
import { AlertCircle } from 'lucide-react';
import type { User, Session, Verdict } from './types/index';
import React from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface PendingInterviewData {
  problemId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mode?: 'marathon' | 'sprint' | 'debug' | 'review' | 'compass' | 'expert-sprint';
  company?: string;
  role?: string;
  experience?: string;
}

// Global Error Boundary
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080A] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 font-display">Something went wrong</h1>
          <p className="text-white/60 mb-8 max-w-md">
            The application encountered a runtime error. This might be due to a data mismatch or a connection issue.
          </p>
          <pre className="p-4 bg-white/5 rounded-lg text-left text-xs text-red-400 mb-8 max-w-2xl overflow-auto w-full">
            {this.state.error?.message || 'Unknown Error'}
            {this.state.error?.stack && `\n\nStack: ${this.state.error.stack.split('\n').slice(0, 3).join('\n')}`}
          </pre>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-8 py-3 rounded-full bg-[#30D8A8] text-[#07080A] font-bold hover:scale-105 transition-transform"
          >
            Clear Data & Restart
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'setup' | 'interview' | 'verdict' | 'diag' | 'compass' | 'analytics'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentVerdict, setCurrentVerdict] = useState<Verdict | null>(null);
  const [pendingInterviewData, setPendingInterviewData] = useState<PendingInterviewData | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const socketInstance = io(API_URL, {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to simulation engine');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, [token]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // If on landing, go to dashboard
          if (currentView === 'landing') setCurrentView('dashboard');
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogin = (receivedToken: string, receivedUser: User) => {
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    setShowAuth(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSocket(null);
    setCurrentView('landing');
  };

  const launchInterview = async (setupData: any) => {
    if (!pendingInterviewData || !token) return;

    try {
      console.log('Launching interview...', { problemId: pendingInterviewData.problemId, ...setupData });

      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: pendingInterviewData.problemId,
          problemTitle: setupData.mode === 'compass' ? 'Company Strategy Session' : pendingInterviewData.problemId,
          problemCategory: setupData.mode === 'compass' ? 'Behavioral' : 'General',
          timeLimit: 3600,
          difficulty: pendingInterviewData.difficulty,
          ...setupData
        })
      });

      if (response.ok) {
        const session = await response.json();
        console.log('Session created successfully:', session);
        setCurrentSession(session);
        socket?.emit('join_interview', { sessionId: session.sessionId });
        setCurrentView('interview');
      } else {
        const errData = await response.json();
        console.error('Session creation failed:', errData);
        alert(`Failed to start interview: ${errData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Interview launch error:', error);
      alert('Connection error. Please try again.');
    }
  };

  const endInterview = async (verdict?: Verdict) => {
    if (currentSession) {
      try {
        await fetch(`${API_URL}/api/sessions/${currentSession.sessionId}/end`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) { console.error("End session failed", e); }
    }

    if (verdict) {
      setCurrentVerdict(verdict);
      setCurrentView('verdict');
    } else if (currentSession) {
      // Fetch verdict manually
      try {
        const res = await fetch(`${API_URL}/api/verdicts/${currentSession.sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentVerdict(data);
          setCurrentView('verdict');
        } else { setCurrentView('dashboard'); }
      } catch (e) { setCurrentView('dashboard'); }
    } else {
      setCurrentView('dashboard');
    }
  };

  const renderView = () => {
    if (currentView === 'landing' || !token) {
      return (
        <LandingPage
          user={user}
          onStartInterview={() => {
            if (token) setCurrentView('dashboard');
            else setShowAuth(true);
          }}
          onLogin={() => {
            setAuthMode('login');
            setShowAuth(true);
          }}
          onDashboard={() => setCurrentView('dashboard')}
          onNavigate={(view: string) => setCurrentView(view as any)}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            token={token}
            onStartInterview={(problemId: string, difficulty: 'easy' | 'medium' | 'hard', mode?: string) => {
              setPendingInterviewData({ problemId, difficulty, mode: mode as any });
              setCurrentView('setup');
            }}
            onLogout={handleLogout}
            onBack={() => setCurrentView('landing')}
            onDiagnose={() => setCurrentView('diag')}
            onNavigate={(view: any) => setCurrentView(view)}
          />
        );

      case 'compass':
        return (
          <CompanyCompass
            token={token}
            onBack={() => setCurrentView('dashboard')}
            onStartInterview={(data: PendingInterviewData) => {
              setPendingInterviewData({
                ...data,
                problemId: (data as any).problemId || 'compass-behavioral-intro',
                difficulty: 'medium'
              });
              setCurrentView('setup');
            }}
          />
        );

      case 'setup':
        if (!pendingInterviewData) {
          setCurrentView('dashboard');
          return null;
        }
        return (
          <InterviewSetup
            problem={{
              id: pendingInterviewData.problemId,
              title: pendingInterviewData.problemId,
              difficulty: pendingInterviewData.difficulty,
              mode: pendingInterviewData.mode
            }}
            onBack={() => setCurrentView('dashboard')}
            onStart={launchInterview}
            targetCompany={pendingInterviewData.company}
            targetRole={pendingInterviewData.role}
            experienceLevel={pendingInterviewData.experience}
          />
        );

      case 'interview':
        if (!currentSession || !socket) {
          return (
            <div className="min-h-screen bg-[#07080A] flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#30D8A8]/20 border-t-[#30D8A8] rounded-full animate-spin mb-4" />
              <p className="text-white/40">Preparing simulation environment...</p>
            </div>
          );
        }
        return (
          <InterviewRoom
            session={currentSession}
            socket={socket}
            token={token}
            onEnd={endInterview}
          />
        );

      case 'verdict':
        if (!currentVerdict) {
          setCurrentView('dashboard');
          return null;
        }
        return (
          <VerdictReport
            verdict={currentVerdict}
            onDashboard={endInterview}
            onRetry={() => {
              setCurrentSession(null);
              setCurrentVerdict(null);
              setCurrentView('setup'); // Or another appropriate view
            }}
            onNavigate={(view) => setCurrentView(view as any)}
          />
        );

      case 'diag':
        return <AIDiagnostic token={token} onBack={() => setCurrentView('dashboard')} />;

      case 'analytics':
        return <ProgressAnalytics token={token} onBack={() => setCurrentView('dashboard')} />;

      default:
        return <div className="p-8">View {currentView} not implemented.</div>;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        handleLogin(data.token, data.user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        handleLogin(data.token, data.user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#07080A] text-white">
        {renderView()}

        {showAuth && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuth(false)}
            onLogin={login}
            onRegister={register}
            onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

// Re-defining App with correctly handled Auth props based on AuthModal.tsx (assumed)
// Wait, I should check AuthModal.tsx props.

export default App;
