'use client';

import { Message, CoreTool, CoreToolResult, ToolInvocation } from 'ai';
import { MarkdownCard } from '@/app/(main)/_components/layout/markdown-card';
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, Loader2 } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState, useMemo, memo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import AiGenerationIcon from '@/icons/AI-Generation';
import { Separator } from "@/components/ui/separator"
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react'

interface AIStoryCreatorProps {
  onInsertMarkdown: (markdown: string) => void;
  selectedItemContent: string;
  selectedItemType: string;
  selectedEpic: any;
  selectedItemId: string;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  projectId: string | null;
}

interface StreamStatus {
  status: 'started' | 'generating' | 'completed' | 'error';
  tool?: string;
  error?: string;
}

interface MessageAnnotation {
  // Add other annotation properties as needed
}

interface DisplayMarkdownTool extends CoreTool {
  name: 'displayMarkdown';
  parameters: {
    content: string;
    metadata?: {
      title?: string;
      type?: string;
    };
  };
}

interface ToolResult {
  content: string;
  metadata?: {
    title?: string;
    type?: string;
  };
}

const AIStoryCreator = memo(function AIStoryCreator({ 
  onInsertMarkdown, 
  selectedItemContent, 
  selectedItemType,
  selectedEpic,
  selectedItemId,
  isCollapsed = false,
  toggleCollapse,
  projectId
}: AIStoryCreatorProps) {
  const [parsedContent, setParsedContent] = useState<any>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasToolError, setHasToolError] = useState(false);
  const [isWaitingForTool, setIsWaitingForTool] = useState(false);
  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  
  // Add debugging logs
  useEffect(() => {
    console.log('AIStoryCreator Props:', {
      selectedItemContent,
      selectedItemType,
      selectedEpic,
      selectedItemId
    });
  }, [selectedItemContent, selectedItemType, selectedEpic, selectedItemId]);

  // Add Convex mutations and queries
  const storeChatHistory = useMutation(api.messages.storeChatHistory);
  const chatHistory = useQuery(api.messages.getChatHistory, 
    selectedItemId && parsedContent?.projectId ? {
      itemId: selectedItemId,
      itemType: selectedItemType,
      projectId: parsedContent.projectId
    } : "skip"
  );

  // Map the chat history to the correct Message type
  const initialMessages = chatHistory?.messages?.map(msg => ({
    ...msg,
    toolInvocations: msg.toolInvocations?.map(tool => ({
      ...tool,
      state: tool.state as "call" | "result", // Explicitly type the state
      result: tool.state === "result" ? tool.result : undefined
    })) as ToolInvocation[] | undefined
  })) as Message[] || [];

  // Add a ref to track streaming state
  const isStreamingRef = useRef(false);

  // Add message processing ref to prevent infinite loops
  const processedMessageIds = useRef<Set<string>>(new Set());
  
  // Modify the useChat configuration
  const chat = useChat({
    initialMessages: initialMessages,
    id: selectedItemId,
    api: '/api/chat',
    body: {
      selectedItemContent,
      selectedItemType,
      selectedEpic: selectedItemType === 'userStory' && selectedEpic?.name && selectedEpic?.description 
        ? {
            name: selectedEpic.name,
            description: selectedEpic.description
          } 
        : null
    },
    // @ts-ignore
    onToolCall: async ({ toolCall }: { toolCall: CoreToolResult<string, unknown, unknown> }) => {
      console.log('Tool called:', toolCall);
      
      if (toolCall.toolName === 'displayMarkdown') {
        try {
          const args = toolCall.args as { 
            content: string; 
            metadata?: { 
              title?: string; 
              type?: string; 
            } 
          };
          
          const result = {
            content: args.content,
            metadata: args.metadata
          };

          return result;
        } catch (error) {
          console.error('Error handling displayMarkdown tool:', error);
          setHasToolError(true);
          throw error;
        }
      }
    },
    onFinish: () => {
      setIsGenerating(false);
      setIsWaitingForTool(false);
      setStreamStatus(null);
    },
    onError: (error) => {
      console.error('Chat Error:', error);
      setHasToolError(true);
      setIsGenerating(false);
      setIsWaitingForTool(false);
      setStreamStatus({ 
        status: 'error', 
        error: error.message
      });
    }
  });

  // Monitor messages for tool completion
  useEffect(() => {
    if (chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      
      // Skip if we've already processed this message
      if (lastMessage.id && processedMessageIds.current.has(lastMessage.id)) {
        return;
      }

      // Mark message as processed
      if (lastMessage.id) {
        processedMessageIds.current.add(lastMessage.id);
      }

      // Process tool invocations
      lastMessage.toolInvocations?.forEach(toolInvocation => {
        if (toolInvocation.state === 'result') {
          setIsWaitingForTool(false);
        }
      });
    }
  }, [chat.messages]);

  // Monitor stream data for status updates
  useEffect(() => {
    if (chat.data?.length) {
      const lastStatus = chat.data[chat.data.length - 1] as unknown as StreamStatus;
      setStreamStatus(lastStatus);
      
      // Handle different status types
      switch (lastStatus.status) {
        case 'started':
          setIsGenerating(true);
          setHasToolError(false);
          break;
        case 'generating':
          setIsWaitingForTool(true);
          break;
        case 'completed':
          setIsGenerating(false);
          setIsWaitingForTool(false);
          break;
        case 'error':
          setHasToolError(true);
          setIsGenerating(false);
          setIsWaitingForTool(false);
          break;
      }
    }
  }, [chat.data]);

  // Add validation effect
  useEffect(() => {
    if (!parsedContent?.projectId) {
      console.warn('Missing required projectId for chat history');
    }
  }, [parsedContent]);

  // Store chat history effect
  useEffect(() => {
    const storeHistory = async () => {
      if (chat.messages.length === 0 || !parsedContent?.projectId) return;

      const lastMessage = chat.messages[chat.messages.length - 1];
      
      // Skip if message is a system message or intermediate state
      if (lastMessage.role === 'system' || 
          lastMessage.content.includes("📝") || 
          lastMessage.content.includes("Modifying content")) {
        return;
      }

      // Skip if we have pending tool invocations
      if (lastMessage.toolInvocations?.some(tool => tool.state !== 'result')) {
        setIsWaitingForTool(true);
        return;
      }

      try {
        await storeChatHistory({
          itemId: selectedItemId,
          itemType: selectedItemType,
          projectId: parsedContent?.projectId,
          messages: chat.messages
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
              role: msg.role,
              content: msg.content,
              id: msg.id,
              toolInvocations: msg.toolInvocations?.map(tool => ({
                toolName: tool.toolName,
                toolCallId: tool.toolCallId,
                state: tool.state,
                args: tool.args,
                result: tool.state === "result" ? tool.result : undefined
              })) || undefined
            }))
        });
      } catch (error) {
        console.error('Error storing chat history:', error);
      }
    };

    storeHistory();
  }, [chat.messages, selectedItemId, selectedItemType, parsedContent?.projectId, storeChatHistory]);

  // Add validation logging
  useEffect(() => {
    if (selectedItemType === 'userStory' && (!selectedEpic?.name || !selectedEpic?.description)) {
      console.warn('Missing required epic context for user story:', selectedEpic);
    }
  }, [selectedItemType, selectedEpic]);

  const handleToolError = (error: Error, toolName: string) => {
    console.error(`Tool Error (${toolName}):`, error);
    setHasToolError(true);
    setStreamStatus({
      status: 'error',
      error: `Failed to execute ${toolName}: ${error.message}`
    });
  };

  // Add this handler function
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page refresh
    chat.handleSubmit(e);
  };

  // Add a useEffect to handle content updates without causing loops
  useEffect(() => {
    if (parsedContent && projectId) {
      // Handle any side effects from content updates here
      // This prevents the infinite loop by separating the update logic
    }
  }, [parsedContent, projectId]);

  // Use Lexical's update listener to handle content changes
  useEffect(() => {
    if (!projectId) {
      console.warn('No projectId provided to AIStoryCreator');
      return;
    }

    try {
      // Parse the editor state if it's a string
      const editorState = typeof selectedItemContent === 'string' 
        ? JSON.parse(selectedItemContent)
        : selectedItemContent;

      setParsedContent({
        content: editorState,
        projectId,
        type: selectedItemType
      });
    } catch (e) {
      console.error('Error parsing editor state:', e);
    }
  }, [projectId, selectedItemType, selectedItemContent]);

  return (
    <Card className="p-0 bg-white rounded-xl h-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <AiGenerationIcon />
              <h2 className="font-semibold text-lg">AI Assistant</h2>
            </>
          )}
        </div>
        <div onClick={toggleCollapse} className="cursor-pointer items-center text-muted-foreground hover:text-foreground transition">
          {isCollapsed ? (
            <>
              <PanelLeftClose className="h-6 w-6 mb-4" />
              <AiGenerationIcon />
            </>
          ) : (
            <PanelLeftOpen className="h-6 w-6" />
          )}
        </div>
      </div>
      {!isCollapsed && (
        <>
          <Separator />
          <div className="space-y-4 p-6 flex-1 overflow-y-auto">
            {chat.messages.map(message => (
              <div key={message.id}>
                <div className="flex justify-start w-full">
                  <div className={cn(message.role === 'user' ? 'w-full' : 'w-[100%]')}>
                    {/* Message content */}
                    {(!message.content.includes("📝 Modifying content") || !hasToolError) && (
                      <div className={cn(
                        "rounded-xl p-4",
                        message.role === 'user' 
                          ? 'bg-slate-100 border border-slate-200' 
                          : 'bg-white'
                      )}>
                        <div className="flex items-start gap-3">
                          {message.role === 'assistant' && <AiGenerationIcon />}
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tool invocations - Show for all messages */}
                    {message.toolInvocations?.map(toolInvocation => {
                      const { toolName, toolCallId, state } = toolInvocation;

                      switch (state) {
                        case 'call':
                          return (
                            <div key={toolCallId} 
                              className="flex items-center gap-2 text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="animate-pulse">
                                Generating content...
                              </span>
                            </div>
                          );
                          
                        case 'result':
                          if (toolName === 'displayMarkdown') {
                            // Safely access content with type checking
                            const content = toolInvocation.result && 
                              'content' in toolInvocation.result ? 
                              toolInvocation.result.content : null;

                            if (!content) {
                              console.error('Missing content for displayMarkdown tool');
                              return (
                                <div key={toolCallId} className="text-red-500">
                                  Error: Failed to display content
                                </div>
                              );
                            }

                            return (
                              <div key={toolCallId} 
                                className="my-2 p-2 border border-slate-200 rounded-lg">
                                <MarkdownCard 
                                  content={content}
                                  onInsert={onInsertMarkdown}
                                />
                              </div>
                            );
                          }
                          break;
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading state for new generations */}
            {isGenerating && !isWaitingForTool && (
              <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">
                  AI is thinking...
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 p-2">
            <Textarea
              value={chat.input}
              onChange={chat.handleInputChange}
              placeholder="Ask me to improve or generate content..."
              className="w-full min-h-[120px] resize-none"
              contextLabel={{
                type: selectedItemType === 'userStory' ? 'User Story' : 
                      selectedItemType === 'epic' ? 'Epic' : 
                      selectedItemType === 'task' ? 'Task' : 
                      selectedItemType,
                name: parsedContent?.name
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              sendButton={
                <Button 
                  type="submit"
                  size="sm"
                  className="bg-slate-300 hover:bg-slate-300 text-white rounded-md transition-colors h-8"
                >
                  <Send className="h-3 w-3" />
                </Button>
              }
            />
          </form>
        </>
      )}
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.selectedItemId === nextProps.selectedItemId &&
         prevProps.selectedItemType === nextProps.selectedItemType &&
         prevProps.selectedItemContent === nextProps.selectedItemContent &&
         prevProps.selectedEpic?.id === nextProps.selectedEpic?.id &&
         prevProps.isCollapsed === nextProps.isCollapsed; // Add collapse comparison
});

export default AIStoryCreator;