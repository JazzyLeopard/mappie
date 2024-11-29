'use client';

import { MarkdownCard } from '@/app/(main)/_components/layout/markdown-card';
import { Button } from "@/components/ui/button";
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
import { Loader2, PanelLeftClose, PanelLeftOpen, Send } from 'lucide-react';
import { FormEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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

const MemoizedMessage = memo(({ message, onInsertMarkdown }: {
  message: Message,
  onInsertMarkdown: (markdown: string) => void
}) => {
  return (
    <div className="space-y-4">
      {message.content && (
        <div className={cn(
          "rounded-xl py-4 px-2",
          message.role === 'user' ? 'bg-slate-100 border border-slate-200' : 'bg-white'
        )}>
          <div className="flex items-start gap-2">
            {message.role === 'assistant' && <AiGenerationIcon />}
            <div className="flex-1">
              <ReactMarkdown
                className="text-sm px-2 leading-relaxed"
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => (
                    <p className="text-gray-600 leading-relaxed" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 mb-2 space-y-2 text-gray-600" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 mb-2 space-y-2 text-gray-600" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="leading-relaxed" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {message.toolInvocations?.map((tool, index) => (
        <div key={`${message.id}-tool-${index}`} className="w-full">
          <MemoizedMarkdownCard
            content={tool.state === 'result' ? tool.result?.content : undefined}
            metadata={tool.state === 'result' ? tool.result?.metadata : undefined}
            onInsert={onInsertMarkdown}
            isLoading={tool.state === 'call'}
          />
        </div>
      ))}
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
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            style={{
              height: '500px',
              scrollBehavior: 'smooth'
            }}
          >
            <div className="space-y-2 p-4">
              {chat.messages.map((message) => (
                <MemoizedMessage
                  key={message.id}
                  message={message}
                  onInsertMarkdown={onInsertMarkdown}
                />
              ))}

              {streamState.isGenerating && !streamState.isWaitingForTool && (
                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="animate-pulse">AI is thinking...</span>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-2 p-2"
          >
            <Textarea
              value={chat.input}
              onChange={chat.handleInputChange}
              placeholder="Ask me to improve or generate content..."
              className="w-full min-h-[120px] resize-none"
              disabled={streamState.isGenerating || streamState.isWaitingForTool}
              contextLabel={{
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
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !streamState.isGenerating && !streamState.isWaitingForTool) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              sendButton={
                <Button
                  type="submit"
                  size="sm"
                  className="bg-slate-300 hover:bg-slate-300 text-white rounded-md transition-colors h-8"
                  disabled={streamState.isGenerating || streamState.isWaitingForTool}
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
    prevProps.isCollapsed === nextProps.isCollapsed;
});

export default AIStoryCreator;