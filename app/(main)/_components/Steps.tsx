import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import AdditionalSteps from './AdditionalSteps'; // Import your AdditionalSteps component here
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const Steps = ({ project }: { project: any }) => {
  const router = useRouter();
  const [step, setStep] = useState(project.onboarding);
  const [inputValue, setInputValue] = useState('');
  const [projectDetails, setProjectDetails] = useState(project);
  const [showAdditionalSteps, setShowAdditionalSteps] = useState(false); // State to manage showing additional steps

  const updateProjectMutation = useMutation(api.projects.updateProject);

  const handleContinue = () => {
      // Implement your logic for handling step transitions
      if (step == 5) {
        setShowAdditionalSteps(true); // Show additional steps if on the last step
    } else {
        setStep(step + 1);
    }
  };

  const handleBack = () => {
   // Implement your logic for handling step transitions
   if (step > 1) {
    setStep(step - 1);
    setShowAdditionalSteps(false); // Reset to hide additional steps if navigating back
    }
    else {
        router.push(`/project/${project.id}/overview`);
    // navigate
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleEditorChange = (event: any, editor: { getData: () => any }, key: string) => {
    const data = editor.getData();
    setProjectDetails({ ...projectDetails, [key]: data });
  };



  const steps = [
    {
      title: 'What is the name of your project?',
      key: 'title',
      placeholder: 'Project Name',
      stepNumber: 1
    },
    {
      title: 'Can you describe your project in a few sentences?',
      key: 'description',
      placeholder: 'Write a description',
      stepNumber: 2
    },
    {
      title: 'What are the main objectives of this project?',
      key: "objectives",
      placeholder: 'Specify Objectives',
      stepNumber: 3
    },
    {
      title: 'What is in scope? What is out of scope?',
      key: "scope",
      placeholder: 'Specify Scope',
      stepNumber: 4
    },
    {
      title: 'Who are the main stakeholders? Who is involved in this project?',
      key: "stakeholders",
      placeholder: 'Specify Stakeholders',
      stepNumber: 5
    },

  ];

  return (
    <>
        {!showAdditionalSteps ?
        (
            <Card className='mt-8 flex flex-col justify-items-start'>
          <CardHeader>
            <CardTitle>{steps[step - 1]?.title}</CardTitle>
          </CardHeader>
          <CardDescription className='w-full'>
          {step === 1 && (
              <Input className='m-4 w-[95%]'
                value={inputValue}
                placeholder={steps[step - 1].placeholder}
                onChange={handleInputChange}
              />
            )}
            {step >= 2 && step <= 5 && (
              <div className='prose max-w-none m-6 p-4 outline outline-slate-200'>
                <CKEditor
                  editor={InlineEditor}
                  data={projectDetails[steps[step - 1]?.key] || ''}
                  onChange={(event, editor) => handleEditorChange(event, editor, steps[step - 1].key)}
                  config={{
                    placeholder: steps[step - 1].placeholder,
                    toolbar: [
                      'bold',
                      'italic',
                      'link',
                      'bulletedList',
                      'numberedList',
                    ],
                    removePlugins: [
                      'BalloonToolbar',
                      'BalloonToolbarUI',
                      'EasyImage',
                      'CKFinder',
                    ],
                  }}
                />
              </div>
            )}  
            {step === 6 && (
              <AdditionalSteps project={project} onAdditionalBackClick={handleBack} />
            )}
          </CardDescription>
          <CardFooter className={`mt-2 flex ${step === 1 ? 'justify-end mt-6' : 'justify-between'}`}>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 ml-1" />
                Back
              </Button>
            )}
            <Button onClick={handleContinue}>
              {step === 5 ? 'View Additional Steps' : 'Continue'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
        ) :(
            <AdditionalSteps project={project} onAdditionalBackClick={handleBack} />
        )}
    </>
  );
};

export default Steps;
