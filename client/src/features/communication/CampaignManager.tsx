import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Plus, Users, Calendar, BarChart2, Loader2, Send } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export const CampaignManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'FEE_COLLECTION',
    channels: ['WHATSAPP'],
    audience: { target: 'DEFAULTERS' }
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/communication/campaigns').then(res => res.data.data)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/communication/campaigns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['communication-stats'] });
      setShowModal(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campaign Manager</h1>
          <p className="text-sm text-slate-500">Create and monitor bulk communication broadcasts.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : campaigns?.map((camp: any) => (
          <Card key={camp.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{camp.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded">
                    {camp.type}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  camp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                  camp.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {camp.status}
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><Users className="w-4 h-4" /> Sent</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{camp.sentCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><BarChart2 className="w-4 h-4" /> Read</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{camp.readCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> Scheduled</span>
                  <span className="font-medium text-slate-900 dark:text-white text-xs">
                    {new Date(camp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {campaigns?.length === 0 && (
          <div className="col-span-full p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <Send className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Campaigns Yet</h3>
            <p className="text-sm text-slate-500 mt-1">Click 'New Campaign' to broadcast your first message.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Create Campaign</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Campaign Name"
                required
                placeholder="e.g. Q3 Fee Reminder"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <Select
                label="Campaign Type"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="FEE_COLLECTION">Fee Collection</option>
                <option value="ADMISSION">Admission</option>
                <option value="EVENT">School Event</option>
                <option value="ACADEMIC">Academic Update</option>
              </Select>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Channels</label>
                <div className="flex gap-4">
                  {['WHATSAPP', 'SMS', 'EMAIL'].map(ch => (
                    <label key={ch} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.channels.includes(ch)}
                        onChange={(e) => {
                          const newCh = e.target.checked 
                            ? [...formData.channels, ch]
                            : formData.channels.filter(c => c !== ch);
                          setFormData({...formData, channels: newCh});
                        }}
                        className="rounded border-slate-300"
                      />
                      {ch}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Scheduling...' : 'Schedule Campaign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
