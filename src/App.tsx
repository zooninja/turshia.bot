import { useState, useEffect, useRef } from 'react';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Mode = 'soft' | 'snappy';

const STORAGE_KEY = 'turshia_bot_chat';
const MODE_KEY = 'turshia_bot_mode';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('snappy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }

    const savedMode = localStorage.getItem(MODE_KEY);
    if (savedMode === 'soft' || savedMode === 'snappy') {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          mode,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        reply?: string;
      };

      if (!response.ok) {
        setError(data.error || 'Нещо се обърка');
        setLoading(false);
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || '',
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (err) {
      setError('Няма връзка със сървъра');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  };

  const resetPersona = () => {
    clearChat();
    setMode('snappy');
    localStorage.removeItem(MODE_KEY);
  };

  const toggleMode = () => {
    setMode(mode === 'soft' ? 'snappy' : 'soft');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="title-section">
            <div className="logo-container">
              <img src="/branding.png" alt="TURSHIA.BOT" className="logo" />
            </div>
          </div>
          <div className="controls">
            <button onClick={toggleMode} className="mode-toggle">
              {mode === 'soft' ? 'Малко по-мек' : 'Малко по-троснат'}
            </button>
            <button onClick={clearChat} className="clear-btn">
              Изчисти чата
            </button>
            <button onClick={resetPersona} className="reset-btn">
              Reset persona
            </button>
          </div>
        </div>
      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome">
              <p>Здрасти бе! Питай ме за туршия и лютеница...</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-content loading">Мисля...</div>
            </div>
          )}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напиши нещо..."
            disabled={loading}
            rows={2}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            Изпрати
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
