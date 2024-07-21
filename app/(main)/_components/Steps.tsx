import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AdditionalSteps from './AdditionalSteps';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import BlockEditor from './BlockEditor';


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
    key: 'additional steps',
    stepNumber: 6
  }
];

const Steps = ({ project }: { project: any }) => {
  const [step, setStep] = useState(project.onboarding);
  const [projectDetails, setProjectDetails] = useState(project);

  const updateProjectMutation = useMutation(api.projects.updateProject);

  useEffect(() => {
    if (step == 0) {
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails;
      payload.onboarding = 0;
      updateProjectMutation(payload);
    }
  }, [step]);

  const handleContinue = async () => {
    try {
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails;
      payload.onboarding = step;
      await updateProjectMutation(payload);
      if (step !== 6) {
        setStep(step + 1);
      } else {
        setStep(0);
      }
    } catch (error) {
      console.log('error updating project', error);
    }
  };

  const handleBack = async () => {
    try {
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails;
      payload.onboarding = step - 1;
      await updateProjectMutation(payload);
      if (step > 1) {
        setStep(step - 1);
      }
    } catch (error) {
      console.log('error updating project', error);
    }
  };

  const handleInputChange = (e: any) => {
    const { value } = e.target;
    setProjectDetails({ ...projectDetails, title: value });
  };

  const handleEditorChange = (attribute: string, value: any) => {
    console.log(attribute, value);
    
    setProjectDetails({ ...projectDetails, [attribute]: value });
  };

  const onEditorBlur = async () => {
    try {
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails
      payload.onboarding = step
      await updateProjectMutation(payload)
    } catch (error) {
      console.log('error updating project', error);
    }
  };

  return (
    <>
      {step !== 6 && (
        <Card className='mt-16 mx-24'>
          <CardHeader>
            <CardTitle>{steps[step - 1]?.title}</CardTitle>
          </CardHeader>
          <CardContent className=''>
            {step === 1 && (
              <Input className='mt-2'
                value={projectDetails.title}
                placeholder={steps[step - 1].placeholder}
                onChange={handleInputChange}
                onBlur={onEditorBlur}
              />
            )}
            {step >= 2 && step <= 5 && (
              <div className='prose max-w-none'>
                <BlockEditor
                  onBlur={onEditorBlur}
                  attribute={steps[step - 1].key}
                  projectDetails={projectDetails}
                  setProjectDetails={(value) => handleEditorChange(steps[step - 1].key, value)}
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
      {step >= 6 && <AdditionalSteps project={project} onBackClick={handleBack} onContinueClick={handleContinue} />}
    </>
  );
}

export default Steps;
