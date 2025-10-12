import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AIChatbot, ChatButton } from "./AIChatbot";

interface AppWithAIProps {
  children: React.ReactNode;
}

export const AppWithAI = ({ children }: AppWithAIProps) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const { user } = useAuth();

  // Get user profile for chatbot context
  const userProfile = user ? {
    county: "Nairobi", // This would come from user profile
    agroZone: "UH1", // This would come from user profile
    experience: "beginner" as const // This would come from user profile
  } : undefined;

  return (
    <>
      {children}
      
      {/* AI Chatbot - only show for authenticated users */}
      {user && (
        <>
          <ChatButton onClick={() => setIsChatbotOpen(true)} />
          <AIChatbot
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
            userProfile={userProfile}
          />
        </>
      )}
    </>
  );
};

