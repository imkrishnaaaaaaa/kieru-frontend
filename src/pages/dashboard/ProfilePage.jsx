import React, { useState } from 'react';
import { User, Mail, Shield, LogOut, Loader2, ChevronDown, ChevronUp, Edit2, Check, X, Telescope, Swords, BicepsFlexed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { useAuth } from '../../context/AuthContext';
import { useAssets, getCharLimit, getFileSizeLimit, getDailySecretLimit } from '../../context/AssetsContext';
import { AuthService } from '../../utils/authService';

export default function ProfilePage() {
   const { userProfile } = useAuth();
   const { charLimits, fileSizeLimits, dailySecretLimits } = useAssets();
   const navigate = useNavigate();

   const displayName = userProfile?.displayName || 'User';
   const email = userProfile?.email || '';
   const role = userProfile?.role || 'User';
   const currentPlan = (userProfile?.subscription || 'ANONYMOUS').toUpperCase();
   const photoUrl = userProfile?.photoUrl;

   const initials = displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [showAccountDetails, setShowAccountDetails] = useState(false);
   const [isEditingName, setIsEditingName] = useState(false);
   const [editedName, setEditedName] = useState(displayName);

   const handleLogout = async () => {
      try {
         setIsLoggingOut(true);
         try {
            await AuthService.logout();
         } catch (e) {
            console.warn('Backend logout failed', e);
         }
         await signOut(auth);
         navigate('/login');
      } catch (error) {
         console.error('Logout failed', error);
         setIsLoggingOut(false);
      }
   };

   const handleSaveName = () => {
      // TODO: Call backend API to update display name
      console.log('Saving name:', editedName);
      setIsEditingName(false);
   };

   const handleCancelEdit = () => {
      setEditedName(displayName);
      setIsEditingName(false);
   };

   // Subscription plan data
   const plans = [
      {
         name: 'EXPLORER',
         icon: Telescope,
         color: 'from-slate-600 to-slate-800',
         bgColor: 'bg-slate-50',
         borderColor: 'border-slate-200',
         textColor: 'text-slate-600',
         tier: 1
      },
      {
         name: 'CHALLENGER',
         icon: Swords,
         color: 'from-slate-700 to-slate-900',
         bgColor: 'bg-slate-50',
         borderColor: 'border-slate-200',
         textColor: 'text-slate-700',
         tier: 2
      },
      {
         name: 'DOMINATOR',
         icon: BicepsFlexed,
         color: 'from-slate-800 to-black',
         bgColor: 'bg-slate-50',
         borderColor: 'border-slate-300',
         textColor: 'text-slate-800',
         tier: 3
      }
   ];

   const currentTier = plans.find(p => p.name === currentPlan)?.tier || 0;

   const formatFileSize = bytes => {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
   };

   return (
      <div className="h-full p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
         <h1 className="text-4xl font-black mb-8 tracking-tight">Profile</h1>

         <div className="max-w-4xl space-y-8">
            {/* Profile Card */}
            <div className="p-8 rounded-[2rem] border border-slate-200 bg-white flex items-center gap-6 shadow-sm">
               {photoUrl ? (
                  <img src={photoUrl} alt="User" loading="lazy" referrerPolicy="no-referrer" className="w-20 h-20 rounded-full object-cover border-2 border-slate-100" />
               ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">{initials}</div>
               )}

               <div>
                  <h2 className="text-xl font-black">{displayName}</h2>
                  <p className="text-slate-500 font-medium">{currentPlan}</p>
               </div>
            </div>

            {/* Account Details - Expandable */}
            <div className="rounded-[2rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
               <button onClick={() => setShowAccountDetails(!showAccountDetails)} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <User size={24} className="text-slate-400" />
                     <span className="font-bold text-slate-700">Account Details</span>
                  </div>
                  {showAccountDetails ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
               </button>

               {showAccountDetails && (
                  <div className="px-6 pb-6 space-y-4 border-t border-slate-100">
                     {/* Display Name */}
                     <div className="pt-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Display Name</label>
                        {isEditingName ? (
                           <div className="flex items-center gap-2">
                              <input
                                 type="text"
                                 value={editedName}
                                 onChange={e => setEditedName(e.target.value)}
                                 className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button onClick={handleSaveName} className="p-2 rounded-xl border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                 <Check size={18} />
                              </button>
                              <button onClick={handleCancelEdit} className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                 <X size={18} />
                              </button>
                           </div>
                        ) : (
                           <div className="flex items-center justify-between">
                              <span className="text-slate-900 font-medium">{displayName}</span>
                              <button onClick={() => setIsEditingName(true)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                                 <Edit2 size={16} />
                              </button>
                           </div>
                        )}
                     </div>

                     {/* Email */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
                        <span className="text-slate-900 font-medium">{email}</span>
                     </div>

                     {/* Role */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Role</label>
                        <span className="text-slate-900 font-medium">{role}</span>
                     </div>
                  </div>
               )}
            </div>

            {/* Subscription Plans */}
            <div className="space-y-4">
               <h2 className="text-2xl font-black">Subscription Plans</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map(plan => {
                     const isCurrentPlan = plan.name === currentPlan;
                     const canUpgrade = plan.tier > currentTier;
                     const isDowngrade = plan.tier < currentTier;
                     const PlanIcon = plan.icon;

                     const dailySecrets = getDailySecretLimit(dailySecretLimits, plan.name);
                     const charLimit = getCharLimit(charLimits, plan.name);
                     const fileSize = getFileSizeLimit(fileSizeLimits, plan.name);

                     return (
                        <div
                           key={plan.name}
                           className={`p-6 rounded-[2rem] border ${isCurrentPlan ? 'border-slate-300 bg-slate-50' : 'border-slate-100 bg-white'} transition-all hover:shadow-md hover:border-slate-200`}>
                           <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                              <PlanIcon size={24} className="text-white" />
                           </div>

                           <h3 className="text-xl font-black mb-2">{plan.name}</h3>

                           <div className="space-y-2 mb-6 text-sm">
                              <div className="flex justify-between">
                                 <span className="text-slate-600">Daily Secrets:</span>
                                 <span className="font-bold">{dailySecrets}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-slate-600">Char Limit:</span>
                                 <span className="font-bold">{charLimit}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-slate-600">File Size:</span>
                                 <span className="font-bold">{formatFileSize(fileSize)}</span>
                              </div>
                           </div>

                           {isCurrentPlan ? (
                              <div className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-center border border-slate-200">Current Plan</div>
                           ) : canUpgrade ? (
                              <button className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-colors">Request</button>
                           ) : (
                              <button disabled className="w-full py-3 rounded-xl bg-slate-50 text-slate-400 font-medium border border-slate-100 cursor-not-allowed">
                                 Seriously?
                              </button>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Sign Out */}
            <button
               onClick={handleLogout}
               disabled={isLoggingOut}
               className="w-full p-6 rounded-[1.5rem] border border-red-100 bg-red-50 text-red-600 flex items-center gap-4 font-bold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
               {isLoggingOut ? <Loader2 className="animate-spin" size={24} /> : <LogOut size={24} />}
               {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
         </div>
      </div>
   );
}
