import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMicrophone, FaStop, FaPlay, FaPause, FaRedo, FaArrowRight } from 'react-icons/fa';
import { challengeAPI } from '../../services/api';
import ProgressIndicator from '../common/ProgressIndicator';

const RecordingStudio = () => {
  const { participantId } = useParams();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [micPermission, setMicPermission] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Request microphone permission on mount
  useEffect(() => {
    requestMicPermission();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      // Stop the stream immediately - we'll request again when recording
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Mic permission error:', err);
      setMicPermission(false);
      setError('Microphone access is required to participate. Please enable it and refresh the page.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError('');

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop at 120 seconds (2 minutes)
          if (newTime >= 120) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording. Please check your microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setError('');
    audioChunksRef.current = [];
  };

  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubmit = async () => {
    // Validate recording duration
    if (recordingTime < 30) {
      setError('⚠️ Recording must be at least 30 seconds long.');
      return;
    }

    if (recordingTime > 120) {
      setError('⚠️ Recording cannot exceed 2 minutes.');
      return;
    }

    if (!audioBlob) {
      setError('Please record your introduction first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`📤 Uploading ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB audio...`);
      const response = await challengeAPI.submitAudio(participantId, audioBlob);
      
      if (response.data.success) {
        // Navigate to evaluation page
        navigate(`/evaluation/${participantId}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit recording. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (recordingTime < 30) return 'text-red-500';
    if (recordingTime >= 30 && recordingTime <= 60) return 'text-green-500';
    return 'text-red-500';
  };

  if (micPermission === false) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold text-primary mb-4">Microphone Access Required</h2>
          <p className="text-text-secondary mb-6">
            Please enable microphone access in your browser settings to participate in the challenge.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:text-accent-teal transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <ProgressIndicator currentStep={2} />
      </div>

      {/* Recording Studio */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 animate-fadeIn">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              Recording Studio
            </h1>
            <p className="text-text-secondary text-lg">
              Record your introduction in English
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-feature-violet/10 to-accent-teal/10 border-l-4 border-feature-violet p-6 mb-8 rounded-lg">
            <h3 className="font-bold text-primary mb-3 text-lg">📋 Instructions:</h3>
            <ul className="space-y-2 text-text-secondary">
              <li>✅ Introduce yourself in English</li>
              <li>✅ Speak clearly and confidently</li>
              <li>✅ Recording duration: <strong>30 seconds to 2 minutes</strong></li>
              <li>✅ You can preview before submitting</li>
              <li>✅ Longer recordings = more detailed evaluation</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Recording Controls */}
          <div className="text-center mb-8">
            {/* Timer Display */}
            <div className={`text-6xl md:text-8xl font-bold mb-8 ${getTimerColor()}`}>
              {formatTime(recordingTime)}
            </div>

            {/* Duration Info */}
            <div className="flex justify-center items-center space-x-4 mb-8 text-sm text-text-secondary">
              <span className={recordingTime >= 30 ? 'text-green-600 font-semibold' : ''}>
                Min: 30s
              </span>
              <span>|</span>
              <span className={recordingTime >= 120 ? 'text-red-600 font-semibold' : ''}>
                Max: 2min
              </span>
            </div>

            {/* Recording Button */}
            {!audioBlob && (
              <div className="space-y-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-6 px-12 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 text-xl"
                  >
                    <FaMicrophone className="inline-block mr-3 text-3xl" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-6 px-12 rounded-full shadow-2xl transition-all duration-300 text-xl animate-pulse"
                  >
                    <FaStop className="inline-block mr-3 text-3xl" />
                    Stop Recording
                  </button>
                )}
              </div>
            )}

            {/* Audio Preview */}
            {audioBlob && (
              <div className="space-y-6">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                  <p className="text-green-700 font-semibold mb-4 text-lg">
                    ✅ Recording captured! Duration: {formatTime(recordingTime)}
                  </p>
                  
                  {/* Audio Player */}
                  <audio
                    ref={audioPlayerRef}
                    src={audioURL}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />

                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlayPause}
                    className="btn-secondary mr-4"
                  >
                    {isPlaying ? (
                      <>
                        <FaPause className="inline mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <FaPlay className="inline mr-2" />
                        Preview
                      </>
                    )}
                  </button>

                  {/* Re-record Button */}
                  <button
                    onClick={resetRecording}
                    className="btn-outline"
                  >
                    <FaRedo className="inline mr-2" />
                    Re-record
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || recordingTime < 30 || recordingTime > 120}
                  className="btn-primary w-full text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="spinner w-5 h-5 border-2 mr-2"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Submit Recording
                      <FaArrowRight className="ml-2" />
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecordingStudio;
