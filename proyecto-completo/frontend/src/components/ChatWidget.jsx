import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Bot, MessageCircle, Minus, Send, X } from 'lucide-react';
import { getToken } from '../utils/auth';

const welcome = { from: 'bot', text: '¡Hola! Soy el asistente de ConectaMax. Por favor, detallá tu consulta o problema específico para poder ayudarte mejor.' };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([welcome]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const hasConversation = messages.some((message) => message.from === 'user');
  const socketRef = useRef(null);

  // Socket.io connection — CORREGIDO 2026-08-31: antes se creaba una conexión
  // nueva en CADA render (io() estaba en el cuerpo del componente, no en un
  // efecto). Ahora se crea una única vez con useRef + useEffect.
  useEffect(() => {
    socketRef.current = io({ auth: { token: getToken() } });

    socketRef.current.on('chat:response', (msg) => {
      setMessages((current) => [...current, { from: 'bot', text: msg.contenido_texto }]);
      setLoading(false);
    });

    socketRef.current.on('chat:error', (err) => {
      setMessages((current) => [...current, { from: 'bot', text: `⚠️ ${err.message}` }]);
      setLoading(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('[Socket.io] connect_error:', err.message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Iniciar/reconectar sesión — función compartida por los DOS puntos de
  // entrada al chat (burbuja flotante y botón "Nuevo ticket"). CORREGIDO
  // 2026-08-31: antes esto solo corría al abrir vía el evento
  // 'conectamax:open-chat' (botón "Nuevo ticket") — abrir con la burbuja
  // directamente nunca llamaba a /api/chat/start, así que sessionId quedaba
  // null para siempre y el input/botón quedaban deshabilitados sin remedio.
  const startSession = () => {
    // Descarta valores basura ("undefined"/"null") que quedaron guardados por una
    // llamada anterior fallida, para que no envenenen los reintentos.
    const stored = sessionStorage.getItem('sesion_id');
    const savedSessionId = stored && stored !== 'undefined' && stored !== 'null' ? stored : null;
    fetch('/api/chat/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(savedSessionId ? { sesion_id: savedSessionId } : {}),
    })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        // Si el backend respondió error o sin sesion_id, no guardar nada y
        // limpiar cualquier id viejo; el catch de abajo avisa en el chat.
        if (!ok || data.sesion_id == null) {
          sessionStorage.removeItem('sesion_id');
          throw new Error(data.message || 'Respuesta inválida de /api/chat/start');
        }
        setSessionId(data.sesion_id);
        sessionStorage.setItem('sesion_id', data.sesion_id);

        if (data.historial_previo && data.historial_previo.length > 0) {
          const historyMessages = data.historial_previo.map((msg) => ({
            from: msg.remitente === 'usuario' ? 'user' : 'bot',
            text: msg.contenido_texto,
          }));
          setMessages(historyMessages);
        }
      })
      .catch((err) => {
        console.error('Error starting chat session:', err);
        setMessages((current) => [...current, { from: 'bot', text: 'Error al iniciar sesión de chat.' }]);
      });
  };

  const openChatWidget = () => {
    setOpen(true);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 0);
    startSession();
  };

  useEffect(() => {
    window.addEventListener('conectamax:open-chat', openChatWidget);
    return () => window.removeEventListener('conectamax:open-chat', openChatWidget);
  }, []);

  const requestClose = () => {
    if (hasConversation) setConfirm(true);
    else setOpen(false);
  };

  const finalize = () => {
    // POST /api/chat/end (Requirement B.5)
    if (sessionId) {
      fetch('/api/chat/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ sesion_id: sessionId }),
      })
        .then(() => {
          sessionStorage.removeItem('sesion_id');
          setSessionId(null);
        })
        .catch((err) => console.error('Error ending chat session:', err));
    }
    
    setConfirm(false);
    setOpen(false);
    setMessages([welcome]);
    setInput('');
  };

  const send = () => {
    const text = input.trim();
    if (!text || !sessionId) return;
    
    setLoading(true);
    setMessages((current) => [...current, { from: 'user', text }]);
    setInput('');
    
    // Emitir chat:message por socket (Requirement B.3)
    socketRef.current?.emit('chat:message', { sesion_id: sessionId, contenido_texto: text });
  };

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Abrir chat de soporte"
        onClick={openChatWidget}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-card bg-brand-sky" />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar chat al hacer click fuera"
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        onClick={requestClose}
      />
      <div
        ref={panelRef}
        className="fixed bottom-6 right-6 z-50 flex h-[490px] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <header className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-card/15">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Soporte ConectaMax</h2>
              <p className="text-xs text-primary-foreground/70">En línea ahora</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Minimizar chat"
            onClick={requestClose}
            className="rounded-lg p-2 hover:bg-card/10"
          >
            <Minus className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <p
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                  message.from === 'user'
                    ? 'rounded-br-md bg-primary text-primary-foreground'
                    : 'rounded-bl-md bg-card text-foreground shadow-sm'
                }`}
              >
                {message.text}
              </p>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <p className="rounded-2xl rounded-bl-md bg-card px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm">
                Escribiendo...
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send();
              }}
              placeholder="Escribí tu consulta..."
              aria-label="Mensaje"
              disabled={loading || !sessionId}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <button
              type="button"
              aria-label="Enviar mensaje"
              onClick={send}
              disabled={loading || !sessionId}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => (hasConversation ? setConfirm(true) : setOpen(false))}
            className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Finalizar Chat
          </button>
        </div>
      </div>
      {confirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-dark/30 p-5"
        >
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-brand-dark">
              ¿Querés finalizar la conversación o seguir chateando?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si finalizás, se borrará el contenido de este chat.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={finalize}
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              >
                Finalizar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirm(false);
                  inputRef.current?.focus();
                }}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground"
              >
                Seguir chateando
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}