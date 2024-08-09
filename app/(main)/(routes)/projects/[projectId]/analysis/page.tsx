"use client"
import { analysisItems } from "@/app/(main)/_components/constants"
import CommonLayout from "@/app/(main)/_components/layout/CommonLayout"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { useEffect, useState } from "react"

interface AnalysisProps {
    params: {
        projectId: Id<"projects">;
    };
}

const Analysis = ({ params }: AnalysisProps) => {
    const [analysisDetails, setanalysisDetails] = useState<any>();

    const id = params.projectId

    const updateAnalysis = useMutation(api.analysis.updateAnalysis)
    const createAnalysis = useMutation(api.analysis.createAnalysis)

    let analysis = useQuery(api.analysis.getAnalysisByProjectId, {
        projectId: id
    })

    if (!analysis) {
        createAnalysis({ projectId: id, functionalRequirements: '', useCase: '' }).then((val) => {
            analysis = val
        })
    }

    useEffect(() => {
        if (analysis) {
            setanalysisDetails(analysis)
        }
        else {

        }
    }, [analysis])


    const updateLabel = (val: string) => {
        setanalysisDetails({ ...analysisDetails, title: val });
    };

    const handleEditorBlur = async () => {
        try {
            console.log('time for API call', analysisDetails);
            const { _creationTime, createdAt, updatedAt, projectId, ...payload } = analysisDetails
            await updateAnalysis(payload)
        } catch (error) {
            console.log('error updating project', error);
        }
    };

    const handleEditorChange = (attribute: string, data: any) => {
        setanalysisDetails({ ...analysisDetails, [attribute]: data });
    };

    if (analysisDetails) {
        return <CommonLayout
            data={analysisDetails}
            menu={analysisItems}
            showTitle={false}
            onEditorBlur={handleEditorBlur}
            updateLabel={updateLabel}
            handleEditorChange={handleEditorChange} />
    }
}

export default Analysis


