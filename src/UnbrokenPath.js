const Dashboard = ({ user, userData, setLoading, setError, setCurrentView }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `user_photos/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      await updateDoc(doc(db, "users", user.uid), {
        original_photo_url: url,
        photoUpdatedAt: serverTimestamp()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleReveal = async (percent) => {
    if (percent > userData.trustScore) return;
    await updateDoc(doc(db, "users", user.uid), {
      current_reveal_percent: percent,
      revealUpdatedAt: serverTimestamp()
    });
  };

  return (
    <div className="p-6 text-white">
      <CrisisButton />
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button onClick={() => signOut(auth)} className="bg-gray-600 px-4 py-2 rounded">Sign Out</button>
      </div>
      <div className="mb-6">
        <h3 className="font-bold mb-2">Identity Shield</h3>
        <img src={userData.avatar_likeness_url} alt="Avatar" className="w-32 h-32 rounded-full mx-auto mb-2" />
        <p className="text-center">{userData.email}</p>
      </div>
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-3" />
        <button onClick={handleUpload} disabled={!file || uploading} className="bg-blue-600 px-4 py-2 rounded">
          {uploading ? 'Uploading…' : 'Upload Photo'}
        </button>
      </div>
      <div className="mt-6">
        <h4 className="font-bold">Reveal Level</h4>
        {[0,25,50,75,100].map(p => (
          <button
            key={p} onClick={() => handleReveal(p)}
            className={`px-3 py-1 m-1 rounded ${userData.current_reveal_percent === p ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            {p}%
          </button>
        ))}
      </div>
      <MilestoneDashboard user={user} userData={userData} setError={setError}/>
    </div>
  );
};


const MeetingTile = ({ participant, isLocalUser }) => {
  const { avatar_likeness_url, original_photo_url, current_reveal_percent, email } = participant;
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    let audioContext, analyser, source, id;
    if (isLocalUser && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 32;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const detect = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a,b)=>a+b)/data.length;
          setIsTalking(avg > 20);
          id = requestAnimationFrame(detect);
        };
        detect();
      });
    }
    return () => {
      if (id) cancelAnimationFrame(id);
      if (audioContext) audioContext.close();
    };
  }, [isLocalUser]);

  const getClipPath = (p) => {
    switch (p) {
      case 25: return 'inset(50% 0 0 50%)';
      case 50: return 'inset(50% 0 0 0)';
      case 75: return 'inset(0 0 0 50%)';
      case 100: return 'inset(0 0 0 0)';
      default: return 'inset(100%)';
    }
  };

  return (
    <div className={`relative aspect-square rounded-xl overflow-hidden border-4 ${isTalking ? 'border-green-400' : 'border-gray-600'}`}>
      <img src={avatar_likeness_url} alt="Avatar" className="w-full h-full object-cover" />
      {current_reveal_percent > 0 && original_photo_url && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${original_photo_url})`, clipPath: getClipPath(current_reveal_percent) }}
        ></div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">{email}</div>
    </div>
  );
};

export default AuthComponent;
export { Dashboard, MeetingTile };
  
