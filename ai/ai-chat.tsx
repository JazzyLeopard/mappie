'use client';

import { MarkdownCard } from '@/app/(main)/_components/layout/markdown-card';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/convex/_generated/api';
import AiGenerationIcon from '@/icons/AI-Generation';
import { cn } from '@/lib/utils';
import { Message } from 'ai';
import { useChat } from 'ai/react';
import { useMutation, useQuery } from 'convex/react';
import { debounce } from 'lodash-es';
import { Loader2, PanelLeftOpen, AlertTriangle } from 'lucide-react';
import { FormEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolState } from '@/lib/types';

interface AIStoryCreatorProps {
  onInsertMarkdown: (markdown: string) => void;
  selectedItemContent: string;
  selectedItemType: string;
  selectedEpic: any;
  selectedUserStory?: any;
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

interface DisplayMarkdownTool {
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

const MemoizedMarkdownCard = memo(MarkdownCard, (prev, next) => {
  return prev.content === next.content && prev.isLoading === next.isLoading;
});

const ChatMessage = memo(({ message, onInsertMarkdown }: {
  message: Message,
  onInsertMarkdown: (markdown: string) => void
}) => {
  return (
    <div className="flex w-full">
      {/* Icon Column - make it flex-shrink-0 to prevent shrinking */}
      <div className="flex-shrink-0">
        {message.role === "assistant" ? (
          <div className="w-8 h-8 items-start">
            <AiGenerationIcon className="h-5 w-5 text-primary" />
          </div>
        ) : null}
      </div>

      {/* Message Content Column - add max-width and overflow handling */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden"> {/* added overflow-hidden */}
        {/* Message Bubble */}
        <div className={cn(
          "text-sm w-full break-words overflow-hidden", // added overflow-hidden
          message.role === "user"
            ? "bg-slate-100 text-gray-900 px-2 py-4 rounded-lg mb-2 mt-2"
            : "text-foreground"
        )}>
          <ReactMarkdown
            className="text-sm px-2 leading-relaxed overflow-hidden" // ensure overflow is hidden
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-3xl font-bold mb-6 border-b pb-2" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-bold mb-4 mt-6" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-semibold mb-3 mt-4" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-lg font-medium mb-2 mt-4" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-gray-600 leading-relaxed" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="leading-relaxed" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code className="bg-gray-100 text-pink-500 px-1 py-0.5 rounded text-sm" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 mb-4" {...props} />
              ),
              pre: ({ node, ...props }) => (
                <pre className="overflow-x-auto max-w-full p-4 bg-gray-100 rounded-lg mb-4" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto max-w-full">
                  <table className="min-w-full" {...props} />
                </div>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>

          {/* Tool Invocations - ensure they stay within bounds */}
          {message.toolInvocations?.map((tool, index) => (
            <div key={`${message.id}-tool-${index}`} className="w-full first:mt-0 min-w-0"> {/* added min-w-0 */}
              <MemoizedMarkdownCard
                content={tool.state === 'result' ? tool.result?.content : undefined}
                metadata={tool.state === 'result' ? tool.result?.metadata : undefined}
                onInsert={onInsertMarkdown}
                isLoading={tool.state === 'call'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// First, define the chat history type
interface ChatHistoryMessage {
  id: string;
  role: string;
  content: string;
  toolInvocations?: {
    toolName: string;
    toolCallId: string;
    state: string;
    args?: any;
    result?: {
      content: string;
      metadata?: {
        title?: string;
        type?: string;
      };
    };
  }[];
}

const AIStoryCreator = memo(function AIStoryCreator({
  onInsertMarkdown,
  selectedItemContent,
  selectedItemType,
  selectedEpic,
  selectedUserStory,
  selectedItemId,
  isCollapsed = false,
  toggleCollapse,
  projectId
}: AIStoryCreatorProps) {
  const [parsedContent, setParsedContent] = useState<any>(null);
  const [streamState, setStreamState] = useState({
    isGenerating: false,
    hasToolError: false,
    isWaitingForTool: false,
    streamStatus: null as StreamStatus | null
  });

  const scrollRef = useRef<HTMLDivElement>(null);


  const storeChatHistory = useMutation(api.messages.storeChatHistory);
  const chatHistory = useQuery(api.messages.getChatHistory,
    selectedItemId && parsedContent?.projectId ? {
      itemId: selectedItemId,
      itemType: selectedItemType,
      projectId: parsedContent.projectId,
    } : "skip"
  );

  // Add a ref to track initialization
  const isInitialized = useRef(false);

  // Modify the chat configuration
  const chat = useChat({
    initialMessages: useMemo(() => {
      // If chatHistory is null or undefined, return empty array
      if (!chatHistory) return [];

      // Check if chatHistory has the messages we need
      const messages = chatHistory.messages as ChatHistoryMessage[] | undefined;
      if (!messages?.length) return [];

      // Only set initial messages if we haven't initialized yet
      if (!isInitialized.current) {
        isInitialized.current = true;
        return messages.map(msg => ({
          id: msg.id,
          role: msg.role as 'system' | 'user' | 'assistant' | 'data', // function | tool
          content: msg.content,
          toolInvocations: msg.toolInvocations?.filter(tool =>
            tool.state === "result" && tool.result?.content
          ).map(tool => ({
            toolCallId: tool.toolCallId,
            toolName: tool.toolName,
            state: tool.state === "result" ? "result" as const : "call" as const,
            args: tool.args || {},
            result: tool.state === "result" ? {
              content: tool.result?.content || '',
              metadata: tool.result?.metadata || {}
            } : undefined
          }))
        }));
      }
      return [];
    }, [chatHistory]),
    id: selectedItemId,
    api: '/api/chat',
    body: {
      selectedItemContent,
      selectedItemType,
      selectedEpic: selectedItemType === 'userStory' && selectedEpic?.name && selectedEpic?.description
        ? { name: selectedEpic.name, description: selectedEpic.description }
        : null
    },
    onError: useCallback((error: any) => {
      console.error('Chat Error:', error);
      setStreamState(prev => ({
        ...prev,
        hasToolError: true,
        isGenerating: false,
        isWaitingForTool: false,
        streamStatus: {
          status: 'error',
          error: error.message
        }
      }));
    }, [])
  });

  // Reset initialization when itemId changes
  useEffect(() => {
    isInitialized.current = false;
  }, [selectedItemId]);

  // Add a scroll handler
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chat.messages.length]);

  // Track the last saved message ID
  const lastSavedMessageIdRef = useRef<string | null>(null);

  // Debounced chat history update with duplicate prevention
  const debouncedUpdateHistory = useMemo(() =>
    debounce(async (messages, itemId, itemType, projectId) => {
      if (messages.length === 0) return;

      // Get the last message ID from the current messages
      const lastMessageId = messages[messages.length - 1].id;

      // If we've already saved this message, skip the update
      if (lastMessageId === lastSavedMessageIdRef.current) {
        return;
      }

      try {
        await storeChatHistory({
          itemId,
          itemType,
          projectId,
          messages: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            id: msg.id,
            toolInvocations: msg.toolInvocations?.map((tool: any) => ({
              toolName: tool.toolName,
              toolCallId: tool.toolCallId,
              state: tool.state,
              args: tool.args,
              result: tool.state === "result" ? tool.result : undefined
            }))
          }))
        });

        // Update the last saved message ID
        lastSavedMessageIdRef.current = lastMessageId;
      } catch (error) {
        console.error('Error updating chat history:', error);
      }
    }, 1000),
    [storeChatHistory]
  );

  // Chat history update effect
  useEffect(() => {
    if (!selectedItemId || !selectedItemType || !parsedContent?.projectId || chat.messages.length === 0) return;

    // Only call the update if we have new messages
    const lastMessageId = chat.messages[chat.messages.length - 1].id;
    if (lastMessageId !== lastSavedMessageIdRef.current) {
      debouncedUpdateHistory(chat.messages, selectedItemId, selectedItemType, parsedContent.projectId);
    }

    return () => {
      debouncedUpdateHistory.cancel();
    };
  }, [chat.messages, selectedItemId, selectedItemType, parsedContent?.projectId]);

  // Reset the lastSavedMessageId when switching items
  useEffect(() => {
    lastSavedMessageIdRef.current = null;
  }, [selectedItemId]);

  // Content parsing effect
  useEffect(() => {
    if (!projectId) return;

    try {
      const editorState = typeof selectedItemContent === 'string'
        ? JSON.parse(selectedItemContent)
        : selectedItemContent;

      setParsedContent({
        content: editorState,
        projectId,
        type: selectedItemType
      });
    } catch (e) {
      setParsedContent((prev: any) => ({
        ...prev,
        projectId,
        type: selectedItemType
      }));
    }
  }, [projectId, selectedItemType, selectedItemContent]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (streamState.isGenerating || streamState.isWaitingForTool) return;

    try {
      setStreamState(prev => ({
        ...prev,
        isGenerating: true,
        hasToolError: false,
        isWaitingForTool: false
      }));

      await chat.handleSubmit(e);
    } catch (error) {
      console.error('Chat submission error:', error);
      setStreamState(prev => ({
        ...prev,
        hasToolError: true
      }));
    } finally {
      setStreamState(prev => ({
        ...prev,
        isGenerating: false,
        isWaitingForTool: false
      }));
    }
  }, [chat, streamState.isGenerating, streamState.isWaitingForTool]);

  return (
    <Card className="p-0 bg-white rounded-xl h-full flex flex-col">
      <div className={cn("p-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <AiGenerationIcon />
              <h2 className="font-semibold text-lg">Mappie AI</h2>
            </>
          )}
        </div>
        <div onClick={toggleCollapse} className="cursor-pointer items-center text-muted-foreground hover:text-foreground transition">
          {isCollapsed ? (
            <>
              <AiGenerationIcon className='h-6 w-6' />
            </>
          ) : (
            <PanelLeftOpen className="h-6 w-6" />
          )}
        </div>
      </div>
      {!isCollapsed && (
        <>
          <Separator />
          <ScrollArea
            ref={scrollRef}
            className="flex-1"
            withShadow={true}
          >
            <div className="space-y-6 p-4 pb-8 max-w-full"> {/* added max-w-full */}
              {chat.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onInsertMarkdown={onInsertMarkdown}
                />
              ))}

              {streamState.isGenerating && !streamState.isWaitingForTool && (
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <AiGenerationIcon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2.5 rounded-2xl rounded-tl-none max-w-[80%]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="animate-pulse">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="space-y-2 p-2">
            <div className="sticky bottom-0 p-2 bg-background">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <Textarea
                    value={chat.input}
                    onChange={(e) => {
                      chat.handleInputChange(e)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault()
                        handleSubmit(e as any)
                      }
                    }}
                    placeholder="Ask me to improve or generate content..."
                    rows={3}
                    className={cn(
                      "resize-none pr-24 pb-12",
                    )}
                    disabled={streamState.isGenerating || streamState.isWaitingForTool}
                    contextLabels={[
                      {
                        type: selectedItemType === 'userStory' ? 'User Story' :
                          selectedItemType === 'epic' ? 'Epic' :
                            selectedItemType === 'useCase' ? 'Use Case' :
                              selectedItemType,
                        name: (() => {
                          if (selectedItemType === 'epic') {
                            return selectedEpic?.name || 'Untitled Epic';
                          } else if (selectedItemType === 'userStory' || selectedItemType === 'useCase') {
                            return selectedUserStory?.title || 'Untitled';
                          }
                          return 'Untitled';
                        })()
                      }
                    ]}
                    variant='chat'
                  />
                </div>
              </form>
              <div className="flex items-center justify-start gap-2 text-xs text-muted-foreground mt-2">
                <AlertTriangle className="h-3 w-3" />
                AI responses may be inaccurate
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.selectedItemId === nextProps.selectedItemId &&
    prevProps.selectedItemType === nextProps.selectedItemType &&
    prevProps.selectedItemContent === nextProps.selectedItemContent &&
    prevProps.selectedEpic?.id === nextProps.selectedEpic?.id &&
    prevProps.isCollapsed === nextProps.isCollapsed;
});

export default AIStoryCreator;