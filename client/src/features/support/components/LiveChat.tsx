import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/authContext';
import { Send, User, Bot, Loader2, Paperclip } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '../../../lib/api';

export const LiveChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and connect socket
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch or create an active chat ticket
  useEffect(() => {
    const initChat = async () => {
      try {
        // Here we could query for an active chat ticket, or create one if none exists
        // For demonstration, we'll fetch tickets and pick the most recent OPEN one, or create one
        const res = await api.get('/support/tickets');
        const tickets = res.data.data;
        let chatTicket = tickets.find((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
        
        if (!chatTicket) {
          const createRes = await api.post('/support/tickets', {
            title: 'Live Chat Request',
            category: 'OTHER',
            priority: 'MEDIUM',
            description: 'Started live chat...'
          });
          chatTicket = createRes.data.data;
        }

        setActiveTicketId(chatTicket.id);
        
        // Fetch messages for this ticket
        const detailsRes = await api.get(`/support/tickets/${chatTicket.id}`);
        setMessages(detailsRes.data.data.messages || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to init chat', err);
        setLoading(false);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (socket && activeTicketId) {
      socket.emit('support:join_ticket', activeTicketId);

      socket.on('new_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('support:typing', (data) => {
        if (data.userId !== user?.id) {
          setIsTyping(data.isTyping);
        }
      });
    }

    return () => {
      if (socket && activeTicketId) {
        socket.emit('support:leave_ticket', activeTicketId);
        socket.off('new_message');
        socket.off('support:typing');
      }
    };
  }, [socket, activeTicketId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  let typingTimeout: any;
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socket && activeTicketId) {
      socket.emit('support:typing', { ticketId: activeTicketId, isTyping: true });
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit('support:typing', { ticketId: activeTicketId, isTyping: false });
      }, 2000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeTicketId) return;

    const content = input;
    setInput('');
    if (socket) socket.emit('support:typing', { ticketId: activeTicketId, isTyping: false });

    try {
      await api.post(`/support/tickets/${activeTicketId}/messages`, { content });
      // The socket event will append it for us and others
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">Support Agent</h3>
            <p className="text-xs text-indigo-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700'}`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 mx-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-start">
            <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700 flex gap-1 items-center">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        <input 
          type="text" 
          value={input} 
          onChange={handleTyping}
          placeholder="Type your message..." 
          className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 rounded-xl px-4 py-2.5 outline-none transition-all" 
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
