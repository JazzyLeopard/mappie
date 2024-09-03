import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from 'react';
import AdditionalSteps from './AdditionalSteps';
import BlockEditor from './BlockEditor';
import { steps } from "./constants";

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

    setProjectDetails({ ...projectDetails, [attribute]: value });
  };

  const onEditorBlur = async () => {
    try {
      // console.log("Time for API call", projectDetails);
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails
      payload.onboarding = step
      await updateProjectMutation(payload)
      console.log("Updataed Details:", payload)
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
                  attribute={steps[step - 1].key}
                  projectDetails={projectDetails}
                  setProjectDetails={(value) => handleEditorChange(steps[step - 1].key, value)}
                  onBlur={onEditorBlur}
                  key={step}
                  onOpenBrainstormChat={() => { }}
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