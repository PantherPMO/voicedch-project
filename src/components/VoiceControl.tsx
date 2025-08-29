import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/api/axios";
import { Badge } from "@/components/ui/badge";

interface VoiceControlProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  onHistoryInfo: (query: string, description: string) => void;
} 

export function VoiceControl({ isActive, onToggle, onHistoryInfo }: VoiceControlProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [localCommandRecognized, setLocalCommandRecognized] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const commands = [
    {
      command: 'go to *',
      callback: (page: string) => {
        setLocalCommandRecognized(true);
      }
    },
    {
      command: ['scroll down', 'scrolldown'],
      callback: () => {
        window.scrollBy(0, window.innerHeight);
        setLocalCommandRecognized(true);
      }
    },
    {
      command: ['scroll up', 'scrollup'],
      callback: () => {
        window.scrollBy(0, -window.innerHeight);
        setLocalCommandRecognized(true);
      }
    },
    {
      command: 'go back',
      callback: () => {
        navigate(-1);
        setLocalCommandRecognized(true);
      }
    },
    {
      command: 'go forward',
      callback: () => {
        navigate(1);
        setLocalCommandRecognized(true);
      }
    },
    {
        command: 'tell me more about this website',
        callback: () => {
            setLocalCommandRecognized(true);
        }
    },
    {
      command: ['find exhibition about *', 'search exhibition for *', 'show me exhibitions about *'],
      callback: (query: string) => {
        setLocalCommandRecognized(true);
      }
    },
    {
      command: ['find artifact about *', 'search artifact for *', 'show me artifacts about *'],
      callback: (query: string) => {
        setLocalCommandRecognized(true);
      }
    },
    {
      command: ['find artifact from * exhibition', 'search artifact from * exhibition', 'show me artifacts from * exhibition'],
      callback: (exhibitionName: string) => {
        setLocalCommandRecognized(true);
      }
    }
  ];

  const { transcript, listening, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition({ commands });

  const processVoiceCommand = async (transcriptToSend: string) => {
    setIsThinking(true);
    console.log('Sending transcript to backend:', transcriptToSend);
    try {
      const response = await axiosInstance.post('/api/voice-command/command', { transcript: transcriptToSend });
      handleBackendResponse(response.data);
    } catch (error) {
      console.error('Error sending voice command to backend:', error);
      toast({
        variant: "destructive",
        title: "Voice Command Error",
        description: "Could not process voice command.",
      });
    } finally {
      resetTranscript();
      setIsThinking(false);
    }
  };

  const handleBackendResponse = (data: any) => {
    if (data.action === 'navigate') {
      navigate(data.value);
    } else if (data.action === 'search') {
      navigate(`/explore?q=${encodeURIComponent(data.value)}`);
    } else if (data.action === 'toast') {
      toast({
        title: data.title,
        description: data.description,
      });
    } else if (data.action === 'none') {
      toast({
        title: 'Voice Command',
        description: 'I did not understand your command. Please try again.',
      });
    } else if (data.action === 'exhibition_results') {
      // Navigate to exhibitions page with search query
      navigate(`/exhibitions?q=${encodeURIComponent(data.query)}`);
      toast({
        title: 'Exhibition Search',
        description: data.message || `Found ${data.resultsCount} exhibitions.`, 
      });
    } else if (data.action === 'artifact_results') {
      // Navigate to explore page with search query
      navigate(`/explore?q=${encodeURIComponent(data.query)}`);
      toast({
        title: 'Artifact Search',
        description: data.message || `Found ${data.resultsCount} artifacts.`, 
      });
    } else if (data.action === 'scroll') {
      if (data.value === 'down') {
        window.scrollBy(0, window.innerHeight);
      } else if (data.value === 'up') {
        window.scrollBy(0, -window.innerHeight);
      }
    } else if (data.action === 'view_exhibition_details') {
      navigate(data.value);
    } else if (data.action === 'view_artifact_details') {
      navigate(data.value);
    } else if (data.action === 'display_history_info') {
      onHistoryInfo(data.query, data.description);
    }
  };

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Voice Control Not Supported",
        description: "Your browser does not support the Web Speech API.",
      });
    }
  }, [browserSupportsSpeechRecognition, toast]);

  useEffect(() => {
    // Stop listening if the component is unmounted or deactivated.
    return () => {
      SpeechRecognition.stopListening();
    };
  }, []);

  useEffect(() => {
    if (localCommandRecognized) {
      resetTranscript();
      setLocalCommandRecognized(false);
      return;
    }

    if (transcript) {
      const timer = setTimeout(() => {
        setIsThinking(true);
        console.log('Sending transcript to backend:', transcript);
        // Send transcript to backend
        processVoiceCommand(transcript);
      }, 1000); // Send after 1 second of silence
      return () => clearTimeout(timer);
    }
  }, [transcript, localCommandRecognized, listening, resetTranscript]);

  useEffect(() => {
    console.log('Listening status:', listening);
  }, [listening]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="p-4 bg-card/95 backdrop-blur shadow-lg border-2 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "voice-indicator h-3 w-3 rounded-full",
            isThinking ? "thinking" : (listening ? "listening" : "idle")
          )} />
          <span className="text-sm font-medium">
            {isThinking ? "Thinking..." : (listening ? "Listening..." : "Voice Control Inactive")}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(false)}
            aria-label="Close voice control"
          >
            <MicOff className="h-4 w-4" />
          </Button>
        </div>

        <div 
          className="mb-4 p-3 bg-muted/50 rounded-md min-h-[3rem] flex items-center"
          role="region"
          aria-live="polite"
          aria-label="Voice command feedback"
        >
          {isThinking ? (
            <p className="text-sm text-muted-foreground italic">
              Thinking...
            </p>
          ) : transcript ? (
            <p className="text-sm">{transcript}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Say a command...
            </p>
          )}
        </div>

        <div className="mt-4 mb-4 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-2">Suggested Commands:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Go to home/explore/exhibitions/about/ethics</Badge>
            <Badge variant="secondary">Show me artifacts about [topic]</Badge>
            <Badge variant="secondary">Tell me more about this website</Badge>
            <Badge variant="secondary">Scroll up/down</Badge>
            <Badge variant="secondary">Go back/forward</Badge>
            <Badge variant="secondary">Find exhibition about [query]</Badge>
            <Badge variant="secondary">Find artifact about [query]</Badge>
            <Badge variant="secondary">Find artifact from [exhibition] exhibition</Badge>
          </div>
        </div>

        <Button
          className="w-full mb-4"
          onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ continuous: true })}
          aria-label={listening ? "Stop listening" : "Start listening"}
        >
          {listening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Listening
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}