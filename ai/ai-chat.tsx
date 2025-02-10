'use client';

import { MarkdownCard } from '@/app/(main)/_components/layout/markdown-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area-1";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/convex/_generated/api';
import AiGenerationIcon from '@/icons/AI-Generation';
import { cn } from '@/lib/utils';
import { Message } from 'ai';
import { useChat } from 'ai/react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { debounce } from 'lodash-es';
import { AlertTriangle, Loader2, PanelLeftOpen, User, X, History, Trash2, Plus, Edit2, Search, FileText, Folder, ListTodo, PanelRightOpen, Maximize2 } from 'lucide-react';
import { FormEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import AiGenerationIconWhite from '@/icons/AI-Generation-White';
import { Id } from '@/convex/_generated/dataModel';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import LabelToInput from '@/app/(main)/_components/LabelToInput';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { getCaretCoordinates } from '@/lib/utils';
import { SearchableItem } from '@/types/search';


interface AIStoryCreatorProps {
  onInsertMarkdown: (markdown: string) => void;
  selectedItemContent: string;
  selectedItemType: string;
  selectedEpic: any;
  selectedUserStory?: any;
  selectedItemId: string;
  selectedItemTitle?: string;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  workspaceId: Id<"workspaces"> | null;
  onRetry?: (messageId: string) => void;
  togglePopOut?: () => void;
  isPopped?: boolean;
}

interface StreamStatus {
  status: 'started' | 'generating' | 'completed' | 'error';
  tool?: string;
  error?: string;
}

const MemoizedMarkdownCard = memo(MarkdownCard, (prev, next) => {
  return prev.content === next.content && prev.isLoading === next.isLoading;
});

interface ChatMessageProps {
  message: Message;
  onRetry: (messageId: string) => void;
  isEditable?: boolean;
  chat: any;
  streamState: any;
  isEditingPreviousMessage?: boolean;
  editingMessageId?: string | null;
}

export function ChatMessage({ 
  message, 
  onRetry, 
  isEditable, 
  chat,
  streamState,
  isEditingPreviousMessage,
  editingMessageId 
}: ChatMessageProps) {
  const isBeingEdited = message.id === editingMessageId;
  const isAfterEditedMessage = editingMessageId ? message.id > editingMessageId : false;

  return (
    <div className={cn(
      "flex gap-2 relative group",
      isAfterEditedMessage && "opacity-50"
    )}>
      <div className={cn(
        "flex-1",
        message.role === 'user' ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"
      )}>
        <div className="relative group gap-1">
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm",
            message.role === 'user' 
              ? "bg-slate-100 text-slate-900 rounded-tr-none" 
              : "bg-transparent rounded-tl-none",
            isBeingEdited && "ring-2 ring-primary"
          )}>
            {message.content}
            {message.role === 'user' && (
              <div className="my-1 text-xs">
                <div className="inline-flex items-center gap-1 text-xs bg-slate-700 px-2 py-1 rounded-md">
                  <span className="text-slate-700">
                    {(() => {
                      if (selectedItemType === 'epic') {
                        return selectedEpic?.name || 'Untitled Feature';
                      } else if (selectedItemType === 'userStory' && selectedUserStory?.title) {
                        return selectedUserStory?.title || 'Untitled';
                      } else if (selectedItemType === 'useCase' || selectedItemType === 'functionalRequirement') {
                        return selectedItemTitle;
                      } else if (selectedItemType === 'Project') {
                        return 'Overview';
                      }
                      return 'Untitled';
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {isEditable && !isEditingPreviousMessage && (
            <button
              onClick={() => {
                chat.setInput(message.content);
                chat.setEditingMessageId(message.id);
              }}
              className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 p-1 rounded-md transition-opacity"
            >
              <Edit2 className="h-4 w-4 text-slate-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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

// Add new interfaces for chat management
interface Chat {
  id: string;
  name: string;
  createdAt: Date;
  lastUpdated: Date;
  messages: Message[];
  context?: {
    itemId?: string;
    itemType?: string;
    itemTitle?: string;
  };
}

interface ChatListProps {
  chats: Chat[];
  activeChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onSearchChats: (query: string) => void;
  onRenameChat: (chatId: string, newName: string) => void;
}

// New ChatList component
const ChatList = memo(({ chats, activeChat, onSelectChat, onCreateChat, onDeleteChat, onSearchChats, onRenameChat }: ChatListProps) => {
  return (
    <div className="flex flex-col h-[500px]">
      <div className="p-3 space-y-3 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Chats</h2>
          <button
            onClick={onCreateChat}
            className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            New Chat
          </button>
        </div>
        <input
          type="search"
          placeholder="Search chats..."
          className="w-full px-3 py-1.5 text-sm rounded-md border"
          onChange={(e) => onSearchChats(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                activeChat?.id === chat.id ? "bg-accent" : "bg-accent/20"
              )}
              onClick={() => onSelectChat(chat)}
            >
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-2">
                    <LabelToInput
                      value={chat.name}
                      setValue={(newName) => onRenameChat(chat.id, newName)}
                      onBlur={() => {}}
                      variant="chat"
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-destructive/10 rounded-md group"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Last used {formatDistanceToNow(new Date(chat.lastUpdated), { addSuffix: true })}
                  </span>
                  {chat.context?.itemTitle && (
                    <Badge variant="outline" className="text-xs">
                      {chat.context.itemTitle}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

export const SearchPopoverContent = ({ 
  workspaceId,
  onSelectItem,
  selectedItems = [],
  initialQuery = ''
}: {
  workspaceId: Id<"workspaces"> | string
  onSelectItem?: (item: SearchableItem) => void
  selectedItems: SearchableItem[]
  initialQuery?: string
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const { workItems, documents } = useQuery(api.search.searchItems, { 
    workspaceId: workspaceId as Id<"workspaces">,
    query: searchQuery || undefined
  }) ?? { workItems: [], documents: [] }

  const items = useMemo(() => {
    const allItems = [
      ...(workItems || []).map(item => ({
        id: item._id,
        type: item.type as SearchableItem['type'],
        title: item.title || 'Untitled'
      })),
      ...(documents || []).map(doc => ({
        id: doc._id,
        type: 'document' as const,
        title: doc.title || 'Untitled'
      }))
    ];

    // Filter items based on search query if provided
    if (searchQuery) {
      return allItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return allItems;
  }, [workItems, documents, searchQuery]);

  return (
    <div 
      ref={popoverRef}
      className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[1000]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 border-b flex items-center gap-2">
        <Search className="h-4 w-4 text-slate-700" />
        <input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-xs w-full bg-transparent outline-none"
        />
      </div>
      <ScrollArea className="h-[300px]">
        {selectedItems.length > 0 && (
          <>
            <div className="p-2">
              <p className="text-xs font-medium text-slate-500 mb-2">Added to context</p>
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                  <ItemIcon type={item.type} />
                  <span className="truncate">{item.title}</span>
                </div>
              ))}
            </div>
            <Separator />
          </>
        )}
        <div className="p-2">
          <p className="text-xs font-medium text-slate-500 mb-2">Available items</p>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectItem?.(item)}
              className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-slate-100 rounded-sm text-sm"
            >
              <ItemIcon type={item.type} />
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

const ItemIcon = ({ type }: { type: SearchableItem['type'] }) => {
  switch (type) {
    case 'document': return <FileText className="h-4 w-4 text-slate-700" />
    case 'epic':
    case 'feature': return <Folder className="h-4 w-4 text-slate-700" />
    case 'story':
    case 'task': return <ListTodo className="h-4 w-4 text-slate-700" />
    default: return null
  }
}

// Modified AIStoryCreator component
const AIStoryCreator = memo(function AIStoryCreator({
  onInsertMarkdown,
  selectedItemContent,
  selectedItemType,
  selectedEpic,
  selectedUserStory,
  selectedItemId,
  selectedItemTitle,
  isCollapsed = false,
  toggleCollapse,
  workspaceId,
  onRetry,
  togglePopOut,
  isPopped = false
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
    selectedItemId && parsedContent?.workspaceId ? {
      itemId: selectedItemId as Id<"workItems">,
      itemType: selectedItemType,
      workspaceId: parsedContent.workspaceId as Id<"workspaces">,
    } : "skip"
  );

  // Add a ref to track initialization
  const isInitialized = useRef(false);

  // Add state for tracking editing message
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

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
    }, []),
    onFinish: () => {
      setEditingMessageId(null);
    }
  });

  // Reset initialization when itemId changes
  useEffect(() => {
    isInitialized.current = false;
  }, [selectedItemId]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  // Update the effect to use the scrollToBottom function
  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, streamState.isGenerating]);

  // Track the last saved message ID
  const lastSavedMessageIdRef = useRef<string | null>(null);

  // Debounced chat history update with duplicate prevention
  const debouncedUpdateHistory = useMemo(() =>
    debounce(async (messages, itemId, itemType, workspaceId) => {
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
          workspaceId,
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
    if (!selectedItemId || !selectedItemType || !parsedContent?.workspaceId || chat.messages.length === 0) return;

    // Only call the update if we have new messages
    const lastMessageId = chat.messages[chat.messages.length - 1].id;
    if (lastMessageId !== lastSavedMessageIdRef.current) {
      debouncedUpdateHistory(chat.messages, selectedItemId, selectedItemType, parsedContent.workspaceId);
    }

    return () => {
      debouncedUpdateHistory.cancel();
    };
  }, [chat.messages, selectedItemId, selectedItemType, parsedContent?.workspaceId]);

  // Reset the lastSavedMessageId when switching items
  useEffect(() => {
    lastSavedMessageIdRef.current = null;
  }, [selectedItemId]);

  // Content parsing effect
  useEffect(() => {
    if (!workspaceId) return;

    try {
      const editorState = typeof selectedItemContent === 'string'
        ? JSON.parse(selectedItemContent)
        : selectedItemContent;

      setParsedContent({
        content: editorState,
        workspaceId,
        type: selectedItemType
      });
    } catch (e) {
      setParsedContent((prev: any) => ({
        ...prev,
        workspaceId,
        type: selectedItemType
      }));
    }
  }, [workspaceId, selectedItemType, selectedItemContent]);

  // Add this near the top of the AIStoryCreator component
  const handleReplace = useCallback(async (content: string): Promise<void> => {
    return Promise.resolve(onInsertMarkdown(content));
  }, [onInsertMarkdown]);

  // Modify handleSubmit to handle both new messages and edits
  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      
      if (editingMessageId) {
        // Find the index of the edited message
        const editedMessageIndex = chat.messages.findIndex(msg => msg.id === editingMessageId);
        
        // Keep only messages before the edited message
        const newMessages = chat.messages.slice(0, editedMessageIndex);
        
        chat.setMessages(newMessages);
        setEditingMessageId(null);
        
        // Submit the edited content as a new message
        chat.handleSubmit(e);
      } else {
        chat.handleSubmit(e);  // Normal submission
      }
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    chat.setInput('');
  };

  // Add new state for chat management
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New chat management functions
  const handleCreateChat = useCallback(() => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      name: "New Chat",
      createdAt: new Date(),
      lastUpdated: new Date(),
      messages: [],
      context: selectedItemId ? {
        itemId: selectedItemId,
        itemType: selectedItemType,
        itemTitle: selectedItemTitle
      } : undefined
    };
    setChats(prev => [...prev, newChat]);
    setActiveChat(newChat);  // Immediately set as active chat
    chat.setMessages([]); // Clear current messages for the new chat
  }, [selectedItemId, selectedItemType, selectedItemTitle]);

  const handleDeleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat?.id === chatId) {
      setActiveChat(null);
    }
  }, [activeChat]);

  const handleSearchChats = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  const handleRenameChat = useCallback((chatId: string, newName: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { 
        ...chat, 
        name: newName,
        lastUpdated: new Date()
      } : chat
    ));
  }, []);

  // Initialize default chat if none exists
  useEffect(() => {
    if (chats.length === 0) {
      const defaultChat: Chat = {
        id: crypto.randomUUID(),
        name: "New Chat",
        createdAt: new Date(),
        lastUpdated: new Date(),
        messages: [],
        context: selectedItemId ? {
          itemId: selectedItemId,
          itemType: selectedItemType,
          itemTitle: selectedItemTitle
        } : undefined
      };
      setChats([defaultChat]);
      setActiveChat(defaultChat);
    }
  }, [selectedItemId, selectedItemType, selectedItemTitle]);

  // Update active chat when user starts typing if no chat is active
  useEffect(() => {
    if (chat.input && !activeChat) {
      const newChat: Chat = {
        id: crypto.randomUUID(),
        name: "New Chat",
        createdAt: new Date(),
        lastUpdated: new Date(),
        messages: [],
        context: selectedItemId ? {
          itemId: selectedItemId,
          itemType: selectedItemType,
          itemTitle: selectedItemTitle
        } : undefined
      };
      setChats(prev => [...prev, newChat]);
      setActiveChat(newChat);
    }
  }, [chat.input, activeChat, selectedItemId, selectedItemType, selectedItemTitle]);

  // Initialize the search query
  const searchResults = useQuery(api.search.searchItems, 
    workspaceId ? {
      workspaceId,
      query: searchQuery || undefined
    } : "skip"
  );

  console.log('AIStoryCreator props:', { 
    workspaceId, 
    selectedItemId, 
    selectedItemType 
  });

  const [showMentionSearch, setShowMentionSearch] = useState(false);
  const [mentionSearchPosition, setMentionSearchPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add these state variables
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);

  // Modify handleInputChange to track text after @
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    chat.setInput(newValue);

    // If we're in mention mode
    if (mentionStartIndex !== null && showMentionSearch) {
      const currentPosition = e.target.selectionStart;
      
      // Check if the @ symbol still exists at mentionStartIndex - 1
      const hasAtSymbol = newValue.charAt(mentionStartIndex - 1) === '@';
      
      if (!hasAtSymbol) {
        // @ was removed, close the popover
        setShowMentionSearch(false);
        setMentionQuery('');
        setMentionStartIndex(null);
        return;
      }

      if (currentPosition >= mentionStartIndex) {
        const query = newValue.slice(mentionStartIndex, currentPosition);
        setMentionQuery(query);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '@' && workspaceId) {
      const textarea = e.currentTarget;
      setMentionStartIndex(textarea.selectionStart + 1);
      setMentionQuery('');
      
      const rect = textarea.getBoundingClientRect();
      const caretCoords = getCaretCoordinates(textarea, textarea.selectionStart);
      
      setMentionSearchPosition({
        top: caretCoords.top - 410,
        left: caretCoords.left
      });
      setShowMentionSearch(true);
    } else if (e.key === 'Backspace' && showMentionSearch) {
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      
      // If we're at the position right after @ or if we're about to delete the @
      if (mentionStartIndex && (cursorPosition === mentionStartIndex || cursorPosition === mentionStartIndex - 1)) {
        setShowMentionSearch(false);
        setMentionQuery('');
        setMentionStartIndex(null);
      }
    }
    
    // Handle other keys
    if (e.key === 'Enter' && !e.shiftKey || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      handleSubmit(e as any);
    } else if (e.key === 'Escape' && showMentionSearch) {
      setShowMentionSearch(false);
      setMentionQuery('');
      setMentionStartIndex(null);
    }
  };

  const handleMentionSelect = (item: SearchableItem) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const value = textarea.value;
    const newValue = `${value.slice(0, cursorPos)}@${item.title} ${value.slice(cursorPos)}`;
    
    chat.setInput(newValue);
    setShowMentionSearch(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMentionSearch && 
          textareaRef.current && 
          !textareaRef.current.contains(event.target as Node)) {
        setShowMentionSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMentionSearch]);

  return (
    <Card className={cn(
      "p-0 bg-white rounded-xl h-full flex flex-col overflow-hidden",
      isCollapsed ? "w-[80px]" : "w-full"
    )}>
      <div className="flex h-full flex-col">
        <div className={cn("p-4", isCollapsed ? "flex flex-col items-center gap-4" : "flex items-center justify-between")}>
          {isCollapsed ? (
            <>
              <AiGenerationIcon className="h-5 w-5" />
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 hover:bg-accent rounded-md">
                    <History className="h-5 w-5 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" side="left" align="start">
                  <ChatList 
                    chats={filteredChats}
                    activeChat={activeChat}
                    onSelectChat={(chat) => {
                      setActiveChat(chat);
                      toggleCollapse?.();
                    }}
                    onCreateChat={handleCreateChat}
                    onDeleteChat={handleDeleteChat}
                    onSearchChats={handleSearchChats}
                    onRenameChat={handleRenameChat}
                  />
                </PopoverContent>
              </Popover>
              <button 
                onClick={() => {
                  handleCreateChat();
                  toggleCollapse?.();
                }}
                className="p-1 hover:bg-accent rounded-md"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </button>
              {!isPopped && (
                <button 
                  onClick={togglePopOut}
                  className="p-1 hover:bg-accent rounded-md"
                >
                  <Maximize2 className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <AiGenerationIcon />
                <div className="flex items-center gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-1 hover:bg-accent rounded-md">
                        <History className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" side="left" align="start">
                      <ChatList 
                        chats={filteredChats}
                        activeChat={activeChat}
                        onSelectChat={setActiveChat}
                        onCreateChat={handleCreateChat}
                        onDeleteChat={handleDeleteChat}
                        onSearchChats={handleSearchChats}
                        onRenameChat={handleRenameChat}
                      />
                    </PopoverContent>
                  </Popover>
                  <button 
                    onClick={handleCreateChat}
                    className="p-1 hover:bg-accent rounded-md"
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                {activeChat && (
                  <div className="flex-1 mr-2">
                    <LabelToInput
                      value={activeChat.name}
                      setValue={(newName) => handleRenameChat(activeChat.id, newName)}
                      onBlur={() => {}}
                      variant="chat"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isPopped && (
                  <button 
                    onClick={togglePopOut}
                    className="p-1 hover:bg-accent rounded-md"
                  >
                    <Maximize2 className="h-5 w-5 text-muted-foreground" />
                  </button>
                )}
                <button 
                  onClick={toggleCollapse} 
                  className="p-1 hover:bg-accent rounded-md"
                >
                  <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </>
          )}
        </div>
        
        {!isCollapsed && (
          <>
            <Separator />
            <ScrollArea
              withShadow={false}
              className="flex-1 overflow-y-auto w-full"
            >
              {activeChat && (
                <div className="space-y-6 p-4 pb-8 w-full max-w-3xl mx-auto">
                  {chat.messages.map((message) => (
                    <div key={message.id} className={cn(
                      "flex gap-2 relative group",
                      editingMessageId && (
                        chat.messages.findIndex(m => m.id === message.id) >
                        chat.messages.findIndex(m => m.id === editingMessageId)
                      ) && "opacity-50"
                    )}>
                      <div className={cn(
                        "flex-1",
                        message.role === 'user' ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"
                      )}>
                        {editingMessageId === message.id ? (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(e as any);
                          }}>
                            <div className="relative">
                              <Textarea
                                ref={textareaRef}
                                value={chat.input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Edit your message..."
                                rows={3}
                                className="resize-none w-full"
                                disabled={streamState.isGenerating}
                                contextLabels={[
                                  {
                                    name: (() => {
                                      if (selectedItemType === 'epic') {
                                        return selectedEpic?.name || 'Untitled Feature';
                                      } else if (selectedItemType === 'userStory' && selectedUserStory?.title) {
                                        return selectedUserStory?.title || 'Untitled';
                                      } else if (selectedItemType === 'useCase' || selectedItemType === 'functionalRequirement') {
                                        return selectedItemTitle;
                                      } else if (selectedItemType === 'Project') {
                                        return 'Overview';
                                      }
                                      return 'Untitled';
                                    })(),
                                    onRemove: () => {
                                      setSelectedItemId(null);
                                      setSelectedItemTitle(null);
                                      setSelectedItemType(null);
                                    }
                                  }
                                ]}
                                workspaceId={workspaceId ?? undefined}
                                onSelectItem={(item) => {
                                  setSelectedItemId(item.id);
                                  setSelectedItemType(item.type);
                                  setSelectedItemTitle(item.title);
                                }}
                                selectedItems={selectedItemId ? [{
                                  id: selectedItemId,
                                  type: selectedItemType as any,
                                  title: selectedItemTitle || 'Untitled',
                                }] : []}
                                variant='chat'
                                autoFocus
                                onMentionSelect={handleMentionSelect}
                                streamState={streamState}
                              />
                              <button
                                onClick={() => {
                                  console.log('Current chat.input:', chat.input);
                                  setEditingMessageId(null);
                                  chat.setInput('');
                                }}
                                className="absolute right-2 top-2 p-1 hover:bg-accent/10 rounded-md"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="relative group gap-1">
                            <div className={cn(
                              "px-2 py-1 rounded-lg text-sm",
                              message.role === 'user' 
                                ? "bg-slate-100 text-slate-900 rounded-tr-none" 
                                : "bg-transparent rounded-tl-none px-1"
                            )}>
                              {message.role === 'user' && (
                                <div className="my-1 text-xs">
                                  <div className="inline-flex items-center gap-1 text-xs bg-slate-200 px-2 py-1 rounded-md">
                                    <span className="text-slate-700">
                                      {(() => {
                                        if (selectedItemType === 'epic') {
                                          return selectedEpic?.name || 'Untitled Feature';
                                        } else if (selectedItemType === 'userStory' && selectedUserStory?.title) {
                                          return selectedUserStory?.title || 'Untitled';
                                        } else if (selectedItemType === 'useCase' || selectedItemType === 'functionalRequirement') {
                                          return selectedItemTitle;
                                        } else if (selectedItemType === 'Project') {
                                          return 'Overview';
                                        }
                                        return 'Untitled';
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <ReactMarkdown
                                className="text-sm leading-relaxed break-words overflow-hidden max-w-full"
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                  h1: ({ node, ...props }) => (
                                    <h1 className="text-2xl font-bold mb-6 border-b pb-2" {...props} />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2 className="text-xl font-bold mb-4 mt-6" {...props} />
                                  ),
                                  h3: ({ node, ...props }) => (
                                    <h3 className="text-lg font-semibold mb-3 mt-4" {...props} />
                                  ),
                                  h4: ({ node, ...props }) => (
                                    <h4 className="text-base font-medium mb-2 mt-4" {...props} />
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

                              {message.toolInvocations?.map((tool, index) => (
                                <div key={`${message.id}-tool-${index}`} className="w-full first:mt-0 overflow-hidden">
                                  <MemoizedMarkdownCard
                                    content={tool.state === 'result' ? tool.result?.content : undefined}
                                    metadata={tool.state === 'result' ? tool.result?.metadata : undefined}
                                    onInsert={onInsertMarkdown}
                                    isLoading={tool.state === 'call'}
                                    onReplace={handleReplace}
                                  />
                                </div>
                              ))}
                            </div>
                            
                            {message.role === 'user' && !editingMessageId && (
                              <button
                                onClick={() => {
                                  chat.setInput(message.content);
                                  setEditingMessageId(message.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 p-1 rounded-md transition-opacity"
                              >
                                <Edit2 className="h-4 w-4 text-slate-600" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
              )}
            </ScrollArea>

            <div className="space-y-2 p-2 pt-0">
              <div className="sticky bottom-0 p-2 pt-0 bg-background">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={chat.input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={editingMessageId 
                      ? "Edit your message..." 
                      : "Ask me to improve or generate content..."}
                    rows={3}
                    className={cn(
                      "resize-none w-full",
                      editingMessageId && "ring-2 ring-primary"
                    )}
                    disabled={streamState.isGenerating}
                    contextLabels={[
                      {
                        name: (() => {
                          if (selectedItemType === 'epic') {
                            return selectedEpic?.name || 'Untitled Feature';
                          } else if (selectedItemType === 'userStory' && selectedUserStory?.title) {
                            return selectedUserStory?.title || 'Untitled';
                          } else if (selectedItemType === 'useCase' || selectedItemType === 'functionalRequirement') {
                            return selectedItemTitle;
                          } else if (selectedItemType === 'Project') {
                            return 'Overview';
                          }
                          return 'Untitled';
                        })(),
                        onRemove: () => {
                          setSelectedItemId(null);
                          setSelectedItemTitle(null);
                          setSelectedItemType(null);
                        }
                      }
                    ]}
                    workspaceId={workspaceId ?? undefined}
                    onSelectItem={(item) => {
                      setSelectedItemId(item.id);
                      setSelectedItemType(item.type);
                      setSelectedItemTitle(item.title);
                    }}
                    selectedItems={selectedItemId ? [{
                      id: selectedItemId,
                      type: selectedItemType as any,
                      title: selectedItemTitle || 'Untitled',
                    }] : []}
                    variant='chat'
                    onMentionSelect={handleMentionSelect}
                    streamState={streamState}
                  />
                  {editingMessageId && (
                    <button
                      onClick={handleCancelEdit}
                      className="absolute right-2 top-2 p-1 hover:bg-accent/10 rounded-md"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-start gap-2 text-xs text-muted-foreground mt-2">
                <AlertTriangle className="h-3 w-3" />
                AI responses may be inaccurate
              </div>
            </div>
          </>
        )}
      </div>
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