import React, { useState, useEffect } from 'react';  
import { db } from './firebase';  
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';  
  
// Milestone definitions  
const MILESTONES = [  
    { id: 'day1', days: 1, title: '24 Hours', emoji: '🌅', color: 'bg-yellow-500' },  
    { id: 'week1', days: 7, title: '1 Week', emoji: '⭐', color: 'bg-blue-500' },  
    { id: 'month1', days: 30, title: '1 Month', emoji: '🏆', color: 'bg-green-500' },  
    { id: 'month3', days: 90, title: '3 Months', emoji: '💎', color: 'bg-purple-500' },  
    { id: 'month6', days: 180, title: '6 Months', emoji: '👑', color: 'bg-indigo-500' },  
    { id: 'year1', days: 365, title: '1 Year', emoji: '🎖️', color: 'bg-red-500' },  
    { id: 'year2', days: 730, title: '2 Years', emoji: '🏅', color: 'bg-pink-500' },  
    { id: 'year5', days: 1825, title: '5 Years', emoji: '🔥', color: 'bg-orange-500' }  
];  
  
// Calculate days since sobriety date  
const calculateDaysSober = (sobrietyDate) => {  
    if (!sobrietyDate) return 0;  
    const today = new Date();  
    const soberDate = sobrietyDate.toDate ? sobrietyDate.toDate() : new Date(sobrietyDate);  
    const diffTime = today - soberDate;  
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));  
    return Math.max(0, diffDays);  
};  
  
// Milestone Badge Component  
const MilestoneBadge = ({ milestone, isEarned, daysSober, onCelebrate }) => {  
    const [showCelebration, setShowCelebration] = useState(false);  
  
    const handleClick = () => {  
        if (isEarned && !showCelebration) {  
            setShowCelebration(true);  
            onCelebrate(milestone);  
            setTimeout(() => setShowCelebration(false), 3000);  
        }  
    };  
  
    return (  
        <div   
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${  
                isEarned   
                    ? `${milestone.color} border-white shadow-lg hover:scale-105`   
                    : 'bg-gray-700 border-gray-600 opacity-50'  
            }`}  
            onClick={handleClick}  
        >  
            <div className="text-center">  
                <div className="text-4xl mb-2">{milestone.emoji}</div>  
                <h3 className="font-bold text-white">{milestone.title}</h3>  
                <p className="text-xs text-gray-200">{milestone.days} days</p>  
                {isEarned && (  
                    <div className="mt-2 text-xs text-green-200">  
                        ✅ Earned!  
                    </div>  
                )}  
            </div>  
              
            {showCelebration && (  
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-2xl">  
                    <div className="text-center animate-bounce">  
                        <div className="text-6xl mb-2">🎉</div>  
                        <p className="text-white font-bold">Congratulations!</p>  
                        <p className="text-gray-300 text-sm">{milestone.title} milestone!</p>  
                    </div>  
                </div>  
            )}  
        </div>  
    );  
};
