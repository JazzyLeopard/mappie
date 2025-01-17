"use client";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import TransitioningTitle from '../components/TransitioningTitle'
import Image from "next/image";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendBetaInterest } from '@/actions/send-beta-interest'

export default function Hero() {
  const [counter, setCounter] = useState(39);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    email: '',
    name: '',
    company: '',
    useCase: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prev) => (prev === 0 ? 39 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      Object.entries(formState).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      const result = await sendBetaInterest(formData);
      
      if (!result.success) throw new Error('Submission failed');
      
      setSubmitStatus('success');
      setTimeout(() => setIsModalOpen(false), 2000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen pt-24 flex flex-col items-center justify-center px-6 md:px-8">
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        <TransitioningTitle />
        <p className="mt-6 text-xl text-center text-gray-600 max-w-2xl px-4 md:px-6">
          Transform your product documentation into clear, dev-ready specifications that your team will actually want to read.
        </p>
        <div className="mt-8 flex flex-col items-center gap-8 w-full">
          <div className="relative w-full max-w-[800px] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] rounded-xl mx-auto">
            {/* Timer Circle */}
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white shadow-lg z-20 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-blue-300 flex items-center justify-center">
                <span className="text-white font-mono text-sm font-bold">
                  {counter}
                </span>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/images-landing/Epics/Home.gif"
                alt="AI-powered documentation editor"
                width={1920}
                height={1080}
                className="rounded-xl w-full h-auto"
                priority
              />
            </div>
          </div>
          <InteractiveHoverButton
            text="Request Access"
            className="w-48 bg-gradient-to-r from-pink-500 to-blue-300 text-white"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Beta Access</DialogTitle>
          </DialogHeader>
          
          {submitStatus === 'success' ? (
            <div className="text-center py-6">
              <h3 className="text-lg font-semibold text-green-600">Thank you for your interest!</h3>
              <p className="mt-2">We'll review your request and send an invitation if there's a good fit.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  required
                  value={formState.name}
                  onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Work Email *</label>
                <Input
                  type="email"
                  required
                  value={formState.email}
                  onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={formState.company}
                  onChange={e => setFormState(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Your organization"
                />
              </div>
              <div>
                <label className="text-sm font-medium">How will you use our product?</label>
                <Textarea
                  value={formState.useCase}
                  onChange={e => setFormState(prev => ({ ...prev, useCase: e.target.value }))}
                  placeholder="Tell us a bit about your needs..."
                  rows={3}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 to-blue-300 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
              {submitStatus === 'error' && (
                <p className="text-red-500 text-sm text-center">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}