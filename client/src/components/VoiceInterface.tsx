import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Phone, PhoneOff, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceInterfaceProps {
  onSpeakingChange: (speaking: boolean) => void;
  onTranscript?: (text: string, role: 'user' | 'assistant') => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange, onTranscript }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received event:', event.type);
    
    switch (event.type) {
      case 'response.audio.delta':
        setIsSpeaking(true);
        onSpeakingChange(true);
        break;
        
      case 'response.audio.done':
        setIsSpeaking(false);
        onSpeakingChange(false);
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        if (onTranscript && event.transcript) {
          onTranscript(event.transcript, 'user');
        }
        break;
        
      case 'response.audio_transcript.delta':
        if (onTranscript && event.delta) {
          onTranscript(event.delta, 'assistant');
        }
        break;
        
      case 'error':
        console.error('Realtime API error:', event);
        toast({
          title: "Error",
          description: event.error?.message || 'An error occurred',
          variant: "destructive",
        });
        break;
    }
  };

  const startConversation = async () => {
    setIsConnecting(true);
    try {
      chatRef.current = new RealtimeChat(handleMessage, selectedVoice, selectedLanguage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "Voice interface is ready. Start speaking!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    onSpeakingChange(false);
    
    toast({
      title: "Disconnected",
      description: "Voice conversation ended",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {!isConnected && (
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-2 block">Voice</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="shimmer">Shimmer</SelectItem>
                <SelectItem value="ash">Ash</SelectItem>
                <SelectItem value="ballad">Ballad</SelectItem>
                <SelectItem value="coral">Coral</SelectItem>
                <SelectItem value="sage">Sage</SelectItem>
                <SelectItem value="verse">Verse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-2 block">Language</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ka">🇬🇪 ქართული</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {!isConnected ? (
        <Button 
          onClick={startConversation}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/80 text-white hover:opacity-90 h-14 text-lg"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Phone className="h-5 w-5 mr-2" />
              Start Voice Conversation
            </>
          )}
        </Button>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-success/10 border border-success/20">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isSpeaking ? 'bg-success animate-pulse' : 'bg-success/50'}`}>
              <Mic className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {isSpeaking ? 'AI is speaking...' : 'Listening...'}
              </p>
              <p className="text-sm text-muted-foreground">
                Speak naturally, AI Concierge will respond
              </p>
            </div>
          </div>
          
          <Button 
            onClick={endConversation}
            variant="destructive"
            className="w-full h-14 text-lg"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            End Conversation
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;
