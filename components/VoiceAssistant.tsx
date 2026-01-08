
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Loader2, Volume2, Waveform } from 'lucide-react';

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [transcription, setTranscription] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Simple decoding for the live audio stream
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array): any => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  };

  const startSession = async () => {
    setStatus('connecting');
    setIsActive(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle output transcription
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => (prev + ' ' + message.serverContent?.outputTranscription?.text).slice(-200));
            }

            // Handle audio output
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              setStatus('speaking');
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(ctx.destination);
              sourceNode.onended = () => {
                sourcesRef.current.delete(sourceNode);
                if (sourcesRef.current.size === 0) setStatus('listening');
              };
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus('listening');
            }
          },
          onerror: (e) => {
            console.error('Live error:', e);
            stopSession();
          },
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: 'You are a smart math assistant. Solve any math problems mentioned and speak clearly. Keep answers concise.',
        },
      });

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromise.then(session => {
          sessionRef.current = session;
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

    } catch (err) {
      console.error('Failed to start session:', err);
      stopSession();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-12 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Voice Assistant</h2>
        <p className="text-sm text-slate-400 max-w-[240px]">Speak your math problems and hear the solution in real-time.</p>
      </div>

      <div className="relative">
        {/* Animated Rings */}
        {isActive && (
          <>
            <div className={`absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse scale-150 transition-all`}></div>
            <div className={`absolute inset-[-20px] border-2 border-blue-500/20 rounded-full animate-ping duration-[3s]`}></div>
          </>
        )}

        <button
          onClick={isActive ? stopSession : startSession}
          disabled={status === 'connecting'}
          className={`
            relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 active:scale-90 shadow-2xl
            ${isActive 
              ? 'bg-red-500/10 border-2 border-red-500/50 text-red-500' 
              : 'bg-blue-500 border-none text-white hover:bg-blue-600 hover:shadow-blue-500/40'
            }
          `}
        >
          {status === 'connecting' ? (
            <Loader2 size={40} className="animate-spin" />
          ) : isActive ? (
            <MicOff size={40} />
          ) : (
            <Mic size={40} />
          )}
          <span className="text-[10px] font-bold uppercase tracking-tighter mt-2">
            {isActive ? 'Stop' : 'Start'}
          </span>
        </button>
      </div>

      <div className="w-full flex flex-col items-center gap-4">
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border transition-all ${
          status === 'idle' ? 'bg-slate-800 text-slate-500 border-white/5' :
          status === 'connecting' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
          status === 'listening' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
          'bg-green-500/10 text-green-500 border-green-500/20 animate-pulse'
        }`}>
          {status}
        </div>

        {transcription && (
          <div className="w-full max-w-sm p-4 bg-white/5 border border-white/5 rounded-2xl text-center italic text-sm text-slate-400 animate-in fade-in duration-300 line-clamp-2">
            "{transcription}..."
          </div>
        )}
      </div>

      {status === 'speaking' && (
        <div className="flex gap-1 items-center h-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 bg-green-500 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
