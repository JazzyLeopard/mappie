// 'use client'

// import React, { useState, useRef, useEffect } from 'react'
// import { ChevronRight, ChevronDown, MoreVertical, Plus } from 'lucide-react'
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Id } from "@/convex/_generated/dataModel"
// import AiGenerationIconWhite from '@/icons/AI-Generation-White'

// interface EpicListProps {
//   epics: any[]
//   userStories: any[] | undefined
//   activeEpicId: Id<"epics"> | null
//   activeUserStoryId: Id<"userStories"> | null
//   onEpicToggle: (epicId: Id<"epics">) => void
//   onEpicTitleClick: (epicId: Id<"epics">, event: React.MouseEvent) => void
//   onCreateUserStory: () => void
//   onDeleteEpic: (epicId: Id<"epics">) => Promise<void>
//   onUserStoryClick: (userStoryId: Id<"userStories">, event: React.MouseEvent) => void
//   onDeleteUserStory: (userStoryId: Id<"userStories">) => Promise<void>
//   onGenerateUserStories: (epicId: Id<"epics">) => Promise<void>
//   onGenerateSingleUserStory: (epicId: Id<"epics">) => Promise<void>
//   isGeneratingUS: boolean
// }

// export default function EpicList({
//   epics,
//   userStories,
//   activeEpicId,
//   activeUserStoryId,
//   onEpicToggle,
//   onEpicTitleClick,
//   onCreateUserStory,
//   onDeleteEpic,
//   onUserStoryClick,
//   onDeleteUserStory,
//   onGenerateUserStories,
//   onGenerateSingleUserStory,
//   isGeneratingUS
// }: EpicListProps) {
//   const [expandedEpics, setExpandedEpics] = useState<Set<Id<"epics">>>(new Set())
//   const clickTimerRef = useRef<NodeJS.Timeout | null>(null)

//   const toggleEpic = (epicId: Id<"epics">) => {
//     setExpandedEpics(prev => {
//       const newSet = new Set(prev)
//       if (newSet.has(epicId)) {
//         newSet.delete(epicId)
//       } else {
//         newSet.add(epicId)
//       }
//       return newSet
//     })
//     onEpicToggle(epicId)
//   }

//   useEffect(() => {
//     return () => {
//       if (clickTimerRef.current) {
//         clearTimeout(clickTimerRef.current)
//       }
//     }
//   }, [])

//   return (
//     <aside className="w-72 bg-white h-full">
//       <ScrollArea className="">
//         <div className="p-4 space-y-2">
//           {epics.map((epic) => (
//             <div
//               key={epic._id}
//               className={`rounded-md overflow-hidden ${activeEpicId === epic._id ? 'bg-slate-100' : ''}`}
//             >
//               <div
//                 className={`flex items-center p-4 group border border-slate-100 bg-slate-200 rounded-md ${
//                   activeEpicId === epic._id && !activeUserStoryId ? 'bg-white' : ''
//                 }`}
//                 onClick={(e) => onEpicTitleClick(epic._id, e)}
//               >
//                 <div className="flex-grow flex items-center space-x-4">
//                   <button
//                     className="focus:outline-none"
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       toggleEpic(epic._id)
//                     }}
//                   >
//                     {expandedEpics.has(epic._id) ? (
//                       <ChevronDown className="h-4 w-4" />
//                     ) : (
//                       <ChevronRight className="h-4 w-4" />
//                     )}
//                   </button>
//                   <p className="text-sm font-semibold cursor-pointer">
//                     {epic.name.length > 13 ? `${epic.name.substring(0, 13)}...` : epic.name}
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <div
//                     className="opacity-0 group-hover:opacity-100 transition-opacity"
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       onCreateUserStory()
//                     }}
//                   >
//                     <Plus className="h-4 w-4 text-gray-500" />
//                   </div>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
//                       <MoreVertical className="h-4 w-4 text-gray-500" />
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent>
//                       <DropdownMenuItem onClick={(e) => {
//                         e.stopPropagation()
//                         onDeleteEpic(epic._id)
//                       }}>
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//               </div>
//               {expandedEpics.has(epic._id) && (
//                 <div className="space-y-2 p-2 w-full">
//                   {userStories?.filter(story => story.epicId === epic._id).map((story) => (
//                     <div
//                       key={story._id}
//                       className={`flex items-center space-x-2 p-2 text-sm font-light rounded cursor-pointer group ${
//                         activeUserStoryId === story._id ? 'bg-white font-bold' : 'hover:bg-slate-200'
//                       }`}
//                       onClick={(e) => onUserStoryClick(story._id, e)}
//                     >
//                       <span>{story.title}</span>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
//                           <MoreVertical className="h-4 w-4 text-gray-500" />
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent>
//                           <DropdownMenuItem onClick={(e) => {
//                             e.stopPropagation()
//                             onDeleteUserStory(story._id)
//                           }}>
//                             Delete
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   ))}
//                   {(!userStories || userStories.filter(story => story.epicId === epic._id).length === 0) ? (
//                     <Button
//                       variant="ghost"
//                       disabled={isGeneratingUS}
//                       className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-xl text-xs mt-2"
//                       onClick={() => onGenerateUserStories(epic._id)}
//                     >
//                       {isGeneratingUS ? "Generating..." : "Generate User Stories with AI"}
//                     </Button>
//                   ) : (
//                     <div className="flex flex-col items-center space-y-1">
//                       <Button
//                         variant="default"
//                         disabled={isGeneratingUS}
//                         className="w-full text-xs bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-xl space-x-2 mt-2 px-2 ml-2"
//                         onClick={() => onGenerateSingleUserStory(epic._id)}
//                       >
//                         <AiGenerationIconWhite />
//                         {isGeneratingUS ? "Generating..." : "Generate a User Story"}
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         className="w-full text-xs mt-2"
//                         onClick={onCreateUserStory}
//                       >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add user story
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </ScrollArea>
//     </aside>
//   )
// }
