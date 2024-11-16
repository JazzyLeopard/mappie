import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon, BarChartIcon, CalendarIcon, ListIcon, XIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { MDXRemote } from 'next-mdx-remote'
import remarkGfm from 'remark-gfm'
import Spinner from "@/components/ui/spinner"
import "./markdown-styles.css";
import { ChakraProvider } from "@chakra-ui/react"
import { UnorderedList, OrderedList, ListItem } from "@chakra-ui/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React, { useState, useEffect, useCallback } from "react"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { Listbox, ListboxItem } from "@nextui-org/react";

interface PresentationModeProps {
  data: any;
  onClose: () => void;
}

export default function PresentationMode({ data, onClose }: PresentationModeProps) {
  const [activeSection, setActiveSection] = useState<string>("description");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [serializedContent, setSerializedContent] = useState<Record<string, MDXRemoteSerializeResult>>({});

  const sections = [
    { id: "description", icon: FileTextIcon },
    { id: "objectives", icon: TargetIcon },
    { id: "requirements", icon: ClipboardCheckIcon },
    { id: "stakeholders", icon: UsersIcon },
    { id: "constraints", icon: LockIcon },
    { id: "budget", icon: DollarSignIcon },
    { id: "dependencies", icon: LinkIcon },
    { id: "priorities", icon: ListIcon },
    { id: "risks", icon: AlertTriangleIcon },
    { id: "targetAudience", icon: UsersIcon },
    { id: "timeline", icon: CalendarIcon },
    { id: "successMetrics", icon: BarChartIcon },
  ].filter(section => data[section.id] && data[section.id].trim() !== "");

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = sections.findIndex(section => section.id === activeSection);
      let nextIndex;
      if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % sections.length;
      } else {
        nextIndex = (currentIndex - 1 + sections.length) % sections.length;
      }
      const nextSection = sections[nextIndex].id;
      setActiveSection(nextSection);
      const element = document.getElementById(nextSection);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeSection, sections]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const serializeContent = async () => {
      const serialized: Record<string, MDXRemoteSerializeResult> = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          serialized[key] = await serialize(value, {
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
            parseFrontmatter: false
          });
        }
      }
      setSerializedContent(serialized);
    };
    serializeContent();
  }, [data]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const elements = document.querySelectorAll('section');

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          foreignObjectRendering: true
        });
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) {
          pdf.addPage();
        }

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio);
        const imgY = 30;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      }

      pdf.save('presentation.pdf');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <aside className="fixed inset-y-0 left-0 z-60 flex h-full w-14 flex-col items-center justify-between border-r bg-background py-5 sm:w-16 md:w-20 lg:w-24">
        <nav className="flex flex-col items-center gap-4">
          {sections.map(({ id, icon: Icon }) => (
            <TooltipProvider key={id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`#${id}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:h-10 md:w-10 lg:h-11 lg:w-11 ${activeSection === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    prefetch={false}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection(id);
                      const element = document.getElementById(id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <Icon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{id.charAt(0).toUpperCase() + id.slice(1)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
        <nav className="flex flex-col items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MaximizeIcon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                  <span className="sr-only">Fullscreen</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Fullscreen</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={generatePDF} disabled={isGeneratingPDF}>
                  {isGeneratingPDF ? (
                    <Spinner size={"lg"} />
                  ) : (
                    <DownloadIcon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                  )}
                  <span className="sr-only">Download PDF</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Download PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
                  <XIcon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                  <span className="sr-only">Close Presentation</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Close Presentation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="ml-14 sm:ml-16 md:ml-20 lg:ml-24">
        {sections.map(({ id }) => (
          <section key={id} id={id} className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 sm:px-6 md:px-10 bg-slate-100">
            <div className="w-fit max-w-4xl mx-auto my-4 rounded-3xl flex py-10 flex-col items-center justify-center gap-4 px-8 sm:px-10 md:px-12">
              <h1 className="text-3xl mb-12 font-bold tracking-tighter text-center sm:text-4xl md:text-5xl lg:text-6xl">{id.charAt(0).toUpperCase() + id.slice(1)}</h1>
              <div className="prose dark:prose-invert max-w-none">
                {serializedContent[id] && (
                  <MDXRemote
                    {...serializedContent[id]}
                    components={{
                      ul: (props: React.HTMLAttributes<HTMLUListElement>) => <UnorderedList {...props} />,
                      ol: (props: React.HTMLAttributes<HTMLOListElement>) => <OrderedList {...props} />,
                      li: (props: React.HTMLAttributes<HTMLLIElement>) => <ListItem {...props} />,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      table: (props) => (
                        <Table {...props} className="border-2 border-border rounded-lg">
                          <TableBody className="rounded-lg">
                            {props.children}
                          </TableBody>
                        </Table>
                      ),
                      thead: TableHeader,
                      tbody: TableBody,
                      tr: TableRow,
                      th: TableHead,
                      td: TableCell,
                    }}
                  />
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="fixed bottom-0 ml-14 sm:ml-16 md:ml-20 lg:ml-24 left-0 right-0 flex justify-center p-4 bg-background/60 backdrop-blur-md">
        <div className="flex flex-row items-center gap-4">
          <p className="text-sm text-muted-foreground">Use arrow keys to navigate</p>
          <ChevronUpIcon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
          <ChevronDownIcon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
        </div>
      </div>
    </div>
  )
}

function ClipboardCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  )
}


function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}


function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}


function MaximizeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}


function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}


function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

const serialize = async (content: any) => {
    const { serialize: mdxSerialize } = await import('next-mdx-remote/serialize');
    return mdxSerialize(content);
};

