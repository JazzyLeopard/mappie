import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Component } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import AdditionalSteps from './AdditionalSteps';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';


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
  {
    key:'additional steps',
    stepNumber: 6
  }
];

const Steps = ({ project }:{project:any}) => {
  const router = useRouter();
  const [step, setStep] = useState(project.onboarding);
  const [projectDetails, setProjectDetails] = useState(project);
  const [currentStep, setCurrentStep] = useState(steps[0]);

  const updateProjectMutation = useMutation(api.projects.updateProject);

  useEffect(() => {
    const foundStep = steps.find(s => s.stepNumber === step);
    if (foundStep) {
      setCurrentStep(foundStep);
    }
  }, [step]);

  const handleContinue = () => {
    console.log("Additional button clicked")
    if (step !== 6) {
      setStep(step + 1);
    } 
  };

  const handleBack = () => {
    console.log('handleBack called');
     if (step > 1) {
      setStep(step - 1);
    } else {
      router.push(`/project/${project.id}/overview`);
    }
  };

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    setProjectDetails({ ...projectDetails, title: value });
  };

  const handleEditorChange = (event: any, editor: { getData: () => any }, key: string) => {
    const data = editor.getData();
    setProjectDetails({ ...projectDetails, [key]: data });
  };

  const onEditorBlur = async () => {
    try {
      console.log('time for API call', projectDetails);
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails
      payload.onboarding = step
      await updateProjectMutation(payload)
    } catch (error) {
      console.log('error updating project', error);
    }
  };

  return (
    <>
      {step !== 6 &&  (
        <Card className='mt-8 flex flex-col justify-items-start'>
          <CardHeader>
            <CardTitle>{currentStep?.title}</CardTitle>
          </CardHeader>
          <CardContent className='w-full'>
            {step === 1 && (
              <Input className='w-full mt-2'
                value={projectDetails.title}
                placeholder={currentStep?.placeholder}
                onChange={handleInputChange}
                onBlur={()=>{onEditorBlur()}}
              />
            )}
            {step >= 2 && step <= 5 && (
              <div className='prose max-w-none'>
                <CKEditor
                  key={step} // Use step as key to force re-render
                  editor={InlineEditor}
                  data={projectDetails[currentStep.key] || ''}
                  onBlur={() => onEditorBlur()}
                  onChange={(event, editor) => handleEditorChange(event, editor, currentStep.key)}
                  config={{
                    placeholder: steps[step-1].placeholder,
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
          </CardContent>
          <CardFooter className={`mt-2 flex ${step === 1 ? 'justify-end' : 'justify-between'}`}>
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
      )}
      {step >= 6 && <AdditionalSteps project={project} onBackClick={handleBack} />}
    </>
  );
}

export default Steps;
