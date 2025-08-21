
```javascript
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
```

```javascript

// Progress Ring Component
const ProgressRing = ({ daysSober, nextMilestone }) => {
    const progress = nextMilestone ? (daysSober / nextMilestone.days) * 100 : 100;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="transparent"
                />
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{daysSober}</div>
                    <div className="text-xs text-gray-400">days</div>
                </div>
            </div>
        </div>
    );
};

// Main Milestone Dashboard Component
const MilestoneDashboard = ({ user, userData, setError }) => {
    const [daysSober, setDaysSober] = useState(0);
    const [earnedMilestones, setEarnedMilestones] = useState([]);
    const [showSobrietyDateInput, setShowSobrietyDateInput] = useState(false);
    const [sobrietyDate, setSobrietyDate] = useState('');

    useEffect(() => {
        if (userData?.sobrietyDate) {
            const days = calculateDaysSober(userData.sobrietyDate);
            setDaysSober(days);
            
            // Calculate earned milestones
            const earned = MILESTONES.filter(m => days >= m.days);
            setEarnedMilestones(earned);
        }
    }, [userData]);

    const setSobrietyDateHandler = async () => {
        if (!sobrietyDate) {
            setError('Please select a sobriety date.');
            return;
        }

        try {
            const soberDate = new Date(sobrietyDate);
            if (soberDate > new Date()) {
                setError('Sobriety date cannot be in the future.');
                return;
            }

            await updateDoc(doc(db, "users", user.uid), {
                sobrietyDate: soberDate,
                sobrietyDateSet: serverTimestamp()
            });

            // Log milestone setup
            await addDoc(collection(db, "milestone_log"), {
                userId: user.uid,
                action: "sobriety_date_set",
                sobrietyDate: soberDate,
                timestamp: serverTimestamp()
            });

            setShowSobrietyDateInput(false);
            setSobrietyDate('');
            setError('');
        } catch (err) {
            console.error('Error setting sobriety date:', err);
            setError('Failed to set sobriety date. Please try again.');
        }
    };

    const celebrateMilestone = async (milestone) => {
        try {
            // Log milestone celebration
            await addDoc(collection(db, "milestone_log"), {
                userId: user.uid,
                action: "milestone_celebrated",
                milestoneId: milestone.id,
                milestoneDays: milestone.days,
                daysSober: daysSober,
                timestamp: serverTimestamp()
            });

            // Update trust score for milestone achievement
            if (userData.trustScore < 100) {
                const trustBonus = Math.min(5, 100 - userData.trustScore);
                await updateDoc(doc(db, "users", user.uid), {
                    trustScore: userData.trustScore + trustBonus
                });
            }
        } catch (err) {
            console.error('Error celebrating milestone:', err);
        }
    };

    const nextMilestone = MILESTONES.find(m => daysSober < m.days);
    const daysToNext = nextMilestone ? nextMilestone.days - daysSober : 0;

    if (!userData?.sobrietyDate) {
        return (
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-center">🏆 Sobriety Milestones</h3>
                
                {!showSobrietyDateInput ? (
                    <div className="text-center">
                        <p className="text-gray-400 mb-6">Set your sobriety date to start tracking milestones and earning digital coins!</p>
                        <button
                            onClick={() => setShowSobrietyDateInput(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            📅 Set Sobriety Date
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Your Sobriety Start Date:</label>
                            <input
                                type="date"
                                value={sobrietyDate}
                                onChange={(e) => setSobrietyDate(e.target.value)}
                                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={setSobrietyDateHandler}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                ✅ Set Date
                            </button>
                            <button
                                onClick={() => setShowSobrietyDateInput(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-center">🏆 Your Sobriety Journey</h3>
            
            {/* Progress Ring */}
            <ProgressRing daysSober={daysSober} nextMilestone={nextMilestone} />
            
            <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-green-400 mb-2">{daysSober} Days Sober</h4>
                {nextMilestone && (
                    <p className="text-gray-400">
                        {daysToNext} days until <span className="font-semibold text-white">{nextMilestone.title}</span>
                    </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                    Since {userData.sobrietyDate.toDate ? userData.sobrietyDate.toDate().toLocaleDateString() : new Date(userData.sobrietyDate).toLocaleDateString()}
                </p>
            </div>

            {/* Milestone Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MILESTONES.map(milestone => (
                    <MilestoneBadge
                        key={milestone.id}
                        milestone={milestone}
                        isEarned={daysSober >= milestone.days}
                        daysSober={daysSober}
                        onCelebrate={celebrateMilestone}
                    />
                ))}
            </div>
            
            {earnedMilestones.length > 0 && (
                <div className="mt-6 text-center">
                    <p className="text-green-400 font-semibold">
                        🎉 You've earned {earnedMilestones.length} milestone{earnedMilestones.length !== 1 ? 's' : ''}!
                    </p>
                </div>
            )}
        </div>
    );
};

export default MilestoneDashboard;
```  
