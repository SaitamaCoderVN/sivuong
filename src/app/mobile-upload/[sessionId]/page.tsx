import { getUploadSessionAction } from '@/lib/actions';
import MobileUploadClient from './MobileUploadClient';
import { Smartphone, AlertTriangle, Key, ShieldX } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default async function MobileUploadPage({ 
  params 
}: { 
  params: Promise<{ sessionId: string }> 
}) {
  const { sessionId } = await params;

  try {
    const session = await getUploadSessionAction(sessionId);

    if (!session || session.used || new Date(session.expires_at) < new Date()) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] px-8 text-center gap-12 bg-slate-50">
          <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-destructive/5 text-destructive shadow-xl shadow-destructive/10 border border-destructive/20 animate-in zoom-in-95 duration-500">
            <ShieldX size={48} strokeWidth={1.5} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">Session Expired</h1>
            <p className="text-slate-500 font-medium max-w-[320px] leading-relaxed mx-auto italic">
              "A ritual link is a transient bridge. This one has dissolved into history."
            </p>
          </div>

          <Card className="max-w-[340px] border-slate-200 bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 flex items-center gap-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                <Key size={28} strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Security Notice</div>
                <div className="text-sm font-bold text-slate-900 leading-tight">Generate a fresh handoff link on your primary ritual device to continue.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <MobileUploadClient sessionId={sessionId} session={session} />;
  } catch (error) {
    console.error("SESSION FETCH ERROR:", error);
    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] px-8 text-center gap-8 bg-slate-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-amber-50 text-amber-600 border border-amber-100 shadow-lg shadow-amber-100/50">
                <AlertTriangle size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ritual Disrupted</h1>
              <p className="text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">We encountered an intellectual friction. The connection to your ritual session has been lost.</p>
            </div>
        </div>
    );
  }
}
