```javascript
import React, { useState, useEffect, useRef } from 'react';
import { auth, db, storage } from './firebase';import MilestoneDashboard from './MilestoneSystem';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    onSnapshot,
    updateDoc,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';

// --- Helper Functions ---
const createUserProfile = async (uid, email) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
        await setDoc(userRef, {
            email: email,
            trustScore: 25,
            avatar_likeness_url: `https://placehold.co/400x400/1a202c/ffffff?text=${email.charAt(0).toUpperCase()}`,
            original_photo_url: '',
            current_reveal_percent: 0,
            sobrietyDate: null,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp()
        });
    } else {
        await updateDoc(userRef, {
            lastActive: serverTimestamp()
        });
    }
};

// --- Helper Components ---
const Spinner = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative border border-gray-700">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            {children}
        </div>
    </div>
);

const CrisisButton = () => {
    const [showModal, setShowModal] = useState(false);
    
    const crisisResources = [
        { name: "National Suicide Prevention Lifeline", number: "988", available: "24/7" },
        { name: "Crisis Text Line", number: "Text HOME to 741741", available: "24/7" },
        { name: "SAMHSA National Helpline", number: "1-800-662-4357", available: "24/7" },
        { name: "National Domestic Violence Hotline", number: "1-800-799-7233", available: "24/7" }
    ];

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
                className="fixed top-4 right-4 z-40 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-200 animate-pulse"
            >
                🆘 Crisis Help
            </button>
            
            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Crisis Resources</h2>
                        <p className="text-gray-300 mb-6">You are not alone. Help is available 24/7.</p>
                        <div className="space-y-4">
                            {crisisResources.map((resource, index) => (
                                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                    <h3 className="font-semibold text-white">{resource.name}</h3>
                                    <p className="text-blue-300 text-lg font-bold">{resource.number}</p>
                                    <p className="text-gray-400 text-sm">{resource.available}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-400 text-sm mt-6">
                            If you're in immediate danger, please call 911 or go to your nearest emergency room.
                        </p>
                    </div>
                </Modal>
            )}
        </>
    );
};
```
    ```javascript

// STAGE 1: Authentication Component
const AuthComponent = ({ setUser, setLoading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);
    const [error, setError] = useState('');

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await createUserProfile(userCredential.user.uid, userCredential.user.email);
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await createUserProfile(userCredential.user.uid, userCredential.user.email);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <CrisisButton />
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-blue-400">Unbroken Path</h1>
                    <p className="text-gray-400 mt-2">Your safe space for healing and connection.</p>
                </div>
                <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
                    <h2 className="text-2xl font-bold text-center mb-6">{isSignUp ? 'Create Your Account' : 'Welcome Back'}</h2>
                    {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</p>}
                    <form onSubmit={handleAuthAction}>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                            {isSignUp ? 'Sign Up' : 'Log In'}
                        </button>
                    </form>
                    <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-4 text-gray-400 hover:text-white">
                        {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};
```
```javascript

// STAGE 2 & 3: Dashboard for Upload and PIRP Controls
const Dashboard = ({ user, userData, setLoading, setError, setCurrentView }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.type.startsWith('image/')) {
                setError('Please select an image file.');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB.');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }
        setUploading(true);
        setError('');
        try {
            const timestamp = Date.now();
            const storageRef = ref(storage, `user_photos/${user.uid}/${timestamp}_${file.name}`);
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    userId: user.uid,
                    uploadedAt: new Date().toISOString()
                }
            };
            
            const snapshot = await uploadBytes(storageRef, file, metadata);
            const original_photo_url = await getDownloadURL(snapshot.ref);
            const avatar_likeness_url = `https://placehold.co/400x400/1a202c/ffffff?text=${userData.email.charAt(0).toUpperCase()}`;

            await updateDoc(doc(db, "users", user.uid), {
                original_photo_url,
                avatar_likeness_url,
                photoUpdatedAt: serverTimestamp()
            });
            
            await addDoc(collection(db, "consent_log"), {
                userId: user.uid,
                action: "photo_upload",
                filename: file.name,
                fileSize: file.size,
                timestamp: serverTimestamp()
            });

        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload photo. Please try again.');
        } finally {
            setUploading(false);
            setFile(null);
        }
    };
    
    const handleReveal = async (percent) => {
        if (percent > userData.trustScore && percent !== 0) {
            setError(`Your trust score of ${userData.trustScore} is not high enough to reveal ${percent}%.`);
            return;
        }
        setLoading(true);
        setError('');
        try {
            await updateDoc(doc(db, "users", user.uid), {
                current_reveal_percent: percent,
                revealUpdatedAt: serverTimestamp()
            });
            await addDoc(collection(db, "consent_log"), {
                userId: user.uid,
                action: "reveal_update",
                fromPercent: userData.current_reveal_percent || 0,
                toPercent: percent,
                timestamp: serverTimestamp()
            });
        } catch (err) {
            console.error('Reveal update error:', err);
            setError('Failed to update reveal level. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const trustTiers = [0, 25, 50, 75, 100];

    return (
        <div className="p-4 md:p-8">
            <CrisisButton />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Your Dashboard</h2>
                <div className="space-x-4">
                    <button 
                        onClick={() => setCurrentView('meeting')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Join Meeting
                    </button>
                    <button 
                        onClick={() => signOut(auth)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Your Identity Shield</h3>
                    <img 
                        src={userData.avatar_likeness_url} 
                        alt="Your Avatar" 
                        className="w-48 h-48 rounded-full mx-auto mb-4 border-4 border-gray-700" 
                    />
                    <p className="text-center text-gray-400 mb-4">{userData.email}</p>
                    <p className="text-center text-gray-300 mb-6">Your User ID (for connecting): <br/><code className="text-sm bg-gray-700 px-2 py-1 rounded">{user.uid}</code></p>
                    
                    <h4 className="font-semibold mt-6 mb-2">Update Your Photo</h4>
                    <p className="text-sm text-gray-400 mb-4">Your original photo is stored privately and is only used for the reveal system.</p>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange} 
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-300 hover:file:bg-blue-500/20"
                    />
                    <button 
                        onClick={handleUpload} 
                        disabled={!file || uploading} 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {uploading ? <Spinner/> : 'Upload & Generate Avatar'}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-2">IronWall Reveal Protocol</h3>
                    <p className="text-gray-400 mb-6">You are in control. Adjust how much of your identity you share in meetings.</p>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-semibold">Your Trust Score:</span>
                           <span className="text-2xl font-bold text-green-400">{userData.trustScore}</span>
                        </div>
                         <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${userData.trustScore}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Your trust score increases with positive community engagement.</p>
                    </div>
                    
                    <div className="mt-8">
                        <label className="block text-gray-400 mb-4 font-semibold">Set Your Reveal Level for Meetings:</label>
                        <div className="flex justify-between items-center space-x-2 md:space-x-4">
                            {trustTiers.map(tier => (
                                <button 
                                    key={tier}
                                    onClick={() => handleReveal(tier)}
                                    disabled={tier > userData.trustScore && tier !== 0}
                                    className={`flex-1 py-3 px-2 rounded-lg text-sm md:text-base font-bold transition-all duration-200
                                        ${userData.current_reveal_percent === tier ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'}
                                        ${tier > userData.trustScore && tier !== 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {tier}%
                                </button>
                            ))}
                        </div>
                         <p className="text-xs text-gray-500 mt-2 text-center">Levels above your trust score are disabled.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
``````javascript

// STAGE 4 & 6: Meeting Component
const MeetingTile = ({ participant, isLocalUser }) => {
    const { avatar_likeness_url, original_photo_url, current_reveal_percent, email } = participant;
    const audioRef = useRef(null);
    const [isTalking, setIsTalking] = useState(false);

    useEffect(() => {
        let audioContext, analyser, source, animationFrameId;

        const setupAudioProcessing = async () => {
            if (isLocalUser && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    source = audioContext.createMediaStreamSource(stream);
                    source.connect(analyser);
                    analyser.fftSize = 32;
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);

                    const detectSpeech = () => {
                        analyser.getByteFrequencyData(dataArray);
                        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                        setIsTalking(average > 20);
                        animationFrameId = requestAnimationFrame(detectSpeech);
                    };
                    detectSpeech();
                } catch (error) {
                    console.error("Error accessing microphone:", error);
                }
            }
        };

        setupAudioProcessing();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (audioContext) audioContext.close();
        };
    }, [isLocalUser]);

    const getClipPath = (percent) => {
        switch (percent) {
            case 25: return 'inset(50% 0 0 50%)';
            case 50: return 'inset(50% 0 0 0)';
            case 75: return 'inset(0 0 0 50%)';
            case 100: return 'inset(0 0 0 0)';
            default: return 'inset(100%)';
        }
    };
    
    const showOriginal = current_reveal_percent > 0 && original_photo_url;

    return (
        <div className={`relative aspect-square bg-gray-700 rounded-2xl overflow-hidden border-4 transition-all duration-300 ${isTalking ? 'border-green-400 shadow-lg shadow-green-500/20' : 'border-gray-600'}`}>
            <img src={avatar_likeness_url} alt="Avatar" className="w-full h-full object-cover"/>
            {showOriginal && (
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500"
                    style={{ 
                        backgroundImage: `url(${original_photo_url})`,
                        clipPath: getClipPath(current_reveal_percent)
                    }}
                />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                <p className="text-white text-sm truncate">{email}</p>
                <p className="text-blue-300 text-xs font-bold">{current_reveal_percent}% Revealed</p>
            </div>
            <audio ref={audioRef} autoPlay playsInline muted={isLocalUser}></audio>
        </div>
    );
};

const Meeting = ({ user, userData, onLeave }) => {
    const [meetingId, setMeetingId] = useState('');
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        if (!activeMeeting) return;
    
        const participantsCol = collection(db, "meetings", activeMeeting, "participants");
        unsubscribeRef.current = onSnapshot(participantsCol, (snapshot) => {
            const parts = [];
            snapshot.forEach(doc => {
                parts.push({ id: doc.id, ...doc.data() });
            });
            setParticipants(parts);
        }, (error) => {
            console.error("Error listening to participants:", error);
            setError("Failed to sync with meeting participants.");
        });
    
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [activeMeeting]);

    const createMeeting = async () => {
        setLoading(true);
        setError('');
        try {
            const meetingRef = await addDoc(collection(db, "meetings"), {
                createdAt: serverTimestamp(),
                hostId: user.uid,
                status: 'active'
            });
            
            await setDoc(doc(db, "meetings", meetingRef.id, "participants", user.uid), {
                ...userData,
                joinedAt: serverTimestamp(),
                isHost: true
            });
            
            setActiveMeeting(meetingRef.id);
        } catch (err) {
            console.error("Error creating meeting:", err);
            setError('Failed to create meeting. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const joinMeeting = async () => {
        if (!meetingId.trim()) {
            setError("Please enter a Meeting ID.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const meetingRef = doc(db, "meetings", meetingId.trim());
            const meetingSnap = await getDoc(meetingRef);
            
            if (!meetingSnap.exists()) {
                throw new Error("Meeting not found. Please check the Meeting ID.");
            }
            
            const meetingData = meetingSnap.data();
            if (meetingData.status === 'ended') {
                throw new Error("This meeting has ended.");
            }
            
            await setDoc(doc(db, "meetings", meetingId.trim(), "participants", user.uid), {
                ...userData,
                joinedAt: serverTimestamp(),
                isHost: false
            });
            
            setActiveMeeting(meetingId.trim());
            setMeetingId('');
        } catch (err) {
            console.error("Error joining meeting:", err);
            setError(err.message || 'Failed to join meeting. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const leaveMeeting = async () => {
        if (!activeMeeting) return;
        
        setLoading(true);
        try {
            await deleteDoc(doc(db, "meetings", activeMeeting, "participants", user.uid));
            
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            
            setActiveMeeting(null);
            setParticipants([]);
            onLeave();
        } catch (err) {
            console.error("Error leaving meeting:", err);
            setError('Failed to leave meeting properly.');
        } finally {
            setLoading(false);
        }
    };

    if (activeMeeting) {
        return (
            <div className="p-4 md:p-8 min-h-screen bg-gray-900">
                <CrisisButton />
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Meeting Room</h2>
                        <p className="text-gray-400">Meeting ID: <code className="bg-gray-700 px-2 py-1 rounded text-blue-300">{activeMeeting}</code></p>
                        <p className="text-gray-500 text-sm">{participants.length} participant{participants.length !== 1 ? 's' : ''} connected</p>
                    </div>
                    <button 
                        onClick={leaveMeeting}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
                    >
                        {loading ? <Spinner /> : 'Leave Meeting'}
                    </button>
                </div>
                
                {participants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {participants.map(participant => (
                            <MeetingTile 
                                key={participant.id} 
                                participant={participant} 
                                isLocalUser={participant.id === user.uid}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <Spinner />
                            <p className="text-gray-400 mt-4">Connecting to meeting...</p>
                        </div>
                    </div>
                )}
                
                <div className="mt-8 bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Meeting Controls</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                            🎤 Mute/Unmute
                        </button>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                            📹 Camera On/Off
                        </button>
                        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                            💬 Chat
                        </button>
                    </div>
                </div>
                
                {error && (
                    <div className="mt-4 bg-red-500/20 text-red-300 p-3 rounded-lg text-center">
                        {error}
                        <button onClick={() => setError('')} className="ml-4 text-red-200 hover:text-white">
                            ✕
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <CrisisButton />
            <div className="w-full max-w-lg bg-gray-800 p-8 rounded-2xl border border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Join a Meeting</h2>
                    <p className="text-gray-400">Connect with others on their recovery journey</p>
                </div>
                
                {error && (
                    <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-6 text-center">
                        {error}
                        <button onClick={() => setError('')} className="ml-4 text-red-200 hover:text-white">
                            ✕
                        </button>
                    </div>
                )}
                
                <div className="space-y-6">
                    <button 
                        onClick={createMeeting} 
                        disabled={loading} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? <Spinner/> : '🎯 Create New Meeting'}
                    </button>
                    
                    <div className="flex items-center">
                        <hr className="flex-grow border-gray-600" />
                        <span className="mx-4 text-gray-400">or</span>
                        <hr className="flex-grow border-gray-600" />
                    </div>
                    
                    <div>
                        <label className="block text-gray-400 mb-2 font-semibold">Join Existing Meeting</label>
                        <input
                            type="text"
                            value={meetingId}
                            onChange={(e) => setMeetingId(e.target.value)}
                            placeholder="Enter Meeting ID"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            onKeyPress={(e) => e.key === 'Enter' && !loading && meetingId.trim() && joinMeeting()}
                        />
                        <button 
                            onClick={joinMeeting} 
                            disabled={loading || !meetingId.trim()} 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {loading ? <Spinner/> : '🚪 Join Meeting'}
                        </button>
                    </div>
                </div>
                
                <button 
                    onClick={onLeave}
                    className="w-full mt-8 text-gray-400 hover:text-white transition-colors"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

// MAIN APP COMPONENT
const UnbrokenPathApp = () => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentView, setCurrentView] = useState('dashboard');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                try {
                    await createUserProfile(authUser.uid, authUser.email);
                    const userDoc = await getDoc(doc(db, "users", authUser.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } catch (error) {
                    console.error('Error setting up user:', error);
                    setError('Failed to load user profile.');
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setUserData(doc.data());
            }
        }, (error) => {
            console.error('Error listening to user data:', error);
            setError('Lost connection to user data.');
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 8000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Spinner />
                    <p className="text-white mt-4 text-xl">Loading Unbroken Path...</p>
                </div>
            </div>
        );
    }

    const ErrorBanner = () => error ? (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-4 text-red-200 hover:text-white">
                ✕
            </button>
        </div>
    ) : null;

    if (!user || !userData) {
        return (
            <>
                <ErrorBanner />
                <AuthComponent setUser={setUser} setLoading={setLoading} />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <ErrorBanner />
            {currentView === 'dashboard' ? (
                <Dashboard 
                    user={user} 
                    userData={userData} 
                    setLoading={setLoading} 
                    setError={setError}
                    setCurrentView={setCurrentView}
                />
            ) : (
                <Meeting 
                    user={user} 
                    userData={userData} 
                    onLeave={() => setCurrentView('dashboard')}
                />
            )}
        </div>
    );
};

export default UnbrokenPathApp;
```
