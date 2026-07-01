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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Global Support Desk</h2>
          <p className="text-sm text-slate-400 mt-1">Manage and resolve issues reported by schools.</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        
        {/* Tickets List */}
        <div className={`w-full md:w-96 border-r border-slate-200 flex flex-col ${activeTicketId ? 'hidden md:flex' : 'flex'}`}>
           <div className="p-4 border-b border-slate-200 bg-white flex gap-2">
              <div className="relative flex-1">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input 
                   type="text" 
                   placeholder="Search tickets..." 
                   className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl pl-9 pr-3 py-2 focus:ring-2 focus:ring-primary outline-none placeholder-slate-400"
                 />
              </div>
              <button className="p-2 bg-white hover:bg-slate-50 rounded-xl text-slate-700 border border-slate-200 shadow-sm">
                 <Filter className="w-4 h-4" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {ticketsLoading ? (
                 <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : tickets?.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">No tickets found.</div>
              ) : (
                 tickets?.map((ticket: any) => (
                    <button 
                      key={ticket.id}
                      onClick={() => setActiveTicketId(ticket.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        activeTicketId === ticket.id 
                          ? 'bg-primary/10 border-primary/30 shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-slate-50'
                      }`}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                             ticket.status === 'OPEN' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                       </div>
                       <h4 className="font-bold text-sm text-slate-900 line-clamp-1 my-1">{ticket.title}</h4>
                       <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {ticket.tenant.name}
                       </p>
                    </button>
                 ))
              )}
           </div>
        </div>

        {/* Ticket Detail / Conversation */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 ${!activeTicketId ? 'hidden md:flex' : 'flex'}`}>
           {!activeTicketId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                 <LifeBuoy className="w-16 h-16 mb-4 text-slate-300" />
                 <h3 className="text-xl font-bold text-slate-900">Select a ticket</h3>
                 <p className="text-sm">Choose a ticket from the list to view details.</p>
              </div>
           ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-4">
                   <button onClick={() => setActiveTicketId(null)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900">
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">{activeTicket?.title}</h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-widest border border-primary/20">
                          {activeTicket?.category}
                        </span>
                     </div>
                     <p className="text-xs font-semibold text-slate-500">
                       Reported by <span className="text-slate-700">{activeTicket?.tenant?.name}</span>
                     </p>
                   </div>
                </div>

                {/* Conversation Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                   {detailsLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                   ) : (
                      <>
                        {/* Original Post */}
                        <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 flex-shrink-0 border border-slate-200">
                             S
                           </div>
                           <div className="flex-1">
                             <div className="flex items-baseline gap-2 mb-1">
                               <span className="font-bold text-sm text-slate-900">School Admin</span>
                               <span className="text-[10px] text-slate-600">{new Date(activeTicket?.createdAt!).toLocaleString()}</span>
                             </div>
                             <div className="bg-white rounded-2xl rounded-tl-none p-4 text-sm text-slate-700 border border-slate-200 shadow-sm">
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
                                    ? 'bg-primary text-white border-primary' 
                                     : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {isSupport ? 'A' : 'S'}
                                </div>
                                <div className={`flex-1 flex flex-col ${isSupport ? 'items-end' : 'items-start'}`}>
                                  <div className={`flex items-baseline gap-2 mb-1 ${isSupport ? 'flex-row-reverse' : ''}`}>
                                      <span className="font-bold text-sm text-slate-900">
                                      {isSupport ? 'Support Team' : 'School Admin'}
                                    </span>
                                    <span className="text-[10px] text-slate-600">{new Date(msg.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm border ${
                                      isSupport 
                                        ? 'bg-primary/10 text-slate-900 rounded-tr-none border-primary/20' 
                                        : 'bg-white text-slate-700 rounded-tl-none border-slate-200 shadow-sm'
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
                <div className="p-4 bg-white border-t border-slate-200">
                   <form onSubmit={handleReply} className="flex items-end gap-2">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your response to the school..."
                        className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary resize-none custom-scrollbar placeholder-slate-400 outline-none"
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
                        className="h-[44px] px-5 bg-primary text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-primary disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
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
