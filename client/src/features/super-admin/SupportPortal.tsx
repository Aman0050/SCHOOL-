import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from './api/superAdminApi';
import { LifeBuoy, Search, Filter, MessageSquare, Loader2, ArrowLeft, Send } from 'lucide-react';

export const SupportPortal: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['superAdminTickets'],
    queryFn: () => superAdminApi.getTickets()
  });

  const { data: activeTicket, isLoading: detailsLoading } = useQuery({
    queryKey: ['superAdminTicketDetails', activeTicketId],
    queryFn: () => superAdminApi.getTicketDetails(activeTicketId!),
    enabled: !!activeTicketId
  });

  const replyMutation = useMutation({
    mutationFn: () => superAdminApi.replyToTicket(activeTicketId!, replyContent),
    onSuccess: () => {
      setReplyContent('');
      queryClient.invalidateQueries({ queryKey: ['superAdminTicketDetails', activeTicketId] });
      queryClient.invalidateQueries({ queryKey: ['superAdminTickets'] });
    }
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    replyMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Global Support Desk</h2>
          <p className="text-sm text-slate-400 mt-1">Manage and resolve issues reported by schools.</p>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row">
        
        {/* Tickets List */}
        <div className={`w-full md:w-96 border-r border-slate-800 flex flex-col ${activeTicketId ? 'hidden md:flex' : 'flex'}`}>
           <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex gap-2">
              <div className="relative flex-1">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input 
                   type="text" 
                   placeholder="Search tickets..." 
                   className="w-full bg-slate-900 border border-slate-800 text-sm text-white rounded-xl pl-9 pr-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                 />
              </div>
              <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 border border-slate-700">
                 <Filter className="w-4 h-4" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {ticketsLoading ? (
                 <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
              ) : tickets?.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No tickets found.</div>
              ) : (
                 tickets?.map((ticket: any) => (
                    <button 
                      key={ticket.id}
                      onClick={() => setActiveTicketId(ticket.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        activeTicketId === ticket.id 
                          ? 'bg-indigo-500/10 border-indigo-500/30 shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-slate-800/50'
                      }`}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                             ticket.status === 'OPEN' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                       </div>
                       <h4 className="font-bold text-sm text-white line-clamp-1 my-1">{ticket.title}</h4>
                       <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> {ticket.tenant.name}
                       </p>
                    </button>
                 ))
              )}
           </div>
        </div>

        {/* Ticket Detail / Conversation */}
        <div className={`flex-1 flex flex-col bg-[#0B0F19] ${!activeTicketId ? 'hidden md:flex' : 'flex'}`}>
           {!activeTicketId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                 <LifeBuoy className="w-16 h-16 mb-4 text-slate-800" />
                 <h3 className="text-xl font-bold text-slate-400">Select a ticket</h3>
                 <p className="text-sm">Choose a ticket from the list to view details.</p>
              </div>
           ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-4">
                   <button onClick={() => setActiveTicketId(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white">
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold text-white leading-tight">{activeTicket?.title}</h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase tracking-widest border border-indigo-500/30">
                          {activeTicket?.category}
                        </span>
                     </div>
                     <p className="text-xs font-semibold text-slate-500">
                       Reported by <span className="text-slate-300">{activeTicket?.tenant?.name}</span>
                     </p>
                   </div>
                </div>

                {/* Conversation Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                   {detailsLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                   ) : (
                      <>
                        {/* Original Post */}
                        <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 flex-shrink-0 border border-slate-700">
                             S
                           </div>
                           <div className="flex-1">
                             <div className="flex items-baseline gap-2 mb-1">
                               <span className="font-bold text-sm text-slate-300">School Admin</span>
                               <span className="text-[10px] text-slate-600">{new Date(activeTicket?.createdAt!).toLocaleString()}</span>
                             </div>
                             <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300 border border-slate-700/50">
                               <p className="whitespace-pre-wrap">{(activeTicket as any)?.description}</p>
                             </div>
                           </div>
                        </div>

                        {/* Replies */}
                        {activeTicket?.messages?.map((msg: any) => {
                           const isSupport = msg.sender.role === 'SUPER_ADMIN';
                           return (
                             <div key={msg.id} className={`flex gap-4 ${isSupport ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                                  isSupport 
                                    ? 'bg-indigo-500 text-white border-indigo-400' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                  {isSupport ? 'A' : 'S'}
                                </div>
                                <div className={`flex-1 flex flex-col ${isSupport ? 'items-end' : 'items-start'}`}>
                                  <div className={`flex items-baseline gap-2 mb-1 ${isSupport ? 'flex-row-reverse' : ''}`}>
                                    <span className="font-bold text-sm text-slate-300">
                                      {isSupport ? 'Support Team' : 'School Admin'}
                                    </span>
                                    <span className="text-[10px] text-slate-600">{new Date(msg.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm border ${
                                    isSupport 
                                      ? 'bg-indigo-500/10 text-indigo-100 rounded-tr-none border-indigo-500/20' 
                                      : 'bg-slate-800/50 text-slate-300 rounded-tl-none border-slate-700/50'
                                  }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                  </div>
                                </div>
                             </div>
                           );
                        })}
                      </>
                   )}
                </div>

                {/* Reply Input */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                   <form onSubmit={handleReply} className="flex items-end gap-2">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your response to the school..."
                        className="flex-1 max-h-32 min-h-[44px] bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar placeholder-slate-600"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(e);
                          }
                        }}
                      />
                      <button 
                        type="submit"
                        disabled={!replyContent.trim() || replyMutation.isPending}
                        className="h-[44px] px-5 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span className="hidden sm:inline">Reply</span>
                      </button>
                   </form>
                </div>
              </>
           )}
        </div>
      </div>
    </div>
  );
};
