import React from 'react';
import { Plus, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HomePage({ setActiveTab }) {
   const { userProfile } = useAuth();

   // Use display name from profile, or fallback to first part of email, or just 'User'
   const displayName = userProfile?.displayName || userProfile?.email?.split('@')[0] || 'User';

   return (
      <div className="p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
         {/* Header */}
         <div className="mb-8">
            <h1 className="text-5xl font-black mb-4 tracking-tighter text-black">Hello, {displayName}</h1>
            <p className="text-slate-400 text-xl font-medium">Your vault is secure.</p>
         </div>

         {/* Intro Banner */}
         <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/60 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center flex-shrink-0">
               <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <p className="text-slate-600 text-base leading-relaxed">
               Share sensitive information securely with <span className="font-semibold text-slate-700">one-time secret links</span> that self-destruct after viewing. Perfect for passwords, API keys,
               and confidential notes.
            </p>
         </div>

         {/* Cards - Pure White Design */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Secret Card */}
            <div
               onClick={() => setActiveTab('create')}
               className="group relative p-8 rounded-[2rem] bg-white border-2 border-slate-100 hover:border-black transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
               <div className="absolute top-8 right-8 text-slate-200 group-hover:text-black transition-colors">
                  <Plus size={32} />
               </div>

               <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Plus size={32} strokeWidth={3} />
               </div>

               <h3 className="text-2xl font-black mb-2 tracking-tight">New Secret</h3>
               <p className="text-slate-500 font-medium text-lg leading-relaxed">Create a secure, one-time link.</p>
            </div>

            {/* History Card */}
            <div
               onClick={() => setActiveTab('secrets')}
               className="group relative p-8 rounded-[2rem] bg-white border-2 border-slate-100 hover:border-black transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
               <div className="absolute top-8 right-8 text-slate-200 group-hover:text-black transition-colors">
                  <Clock size={32} />
               </div>

               <div className="w-16 h-16 bg-white border-2 border-black text-black rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Clock size={32} strokeWidth={3} />
               </div>

               <h3 className="text-2xl font-black mb-2 tracking-tight">History</h3>
               <p className="text-slate-500 font-medium text-lg leading-relaxed">Track status of sent secrets.</p>
            </div>
         </div>
      </div>
   );
}
