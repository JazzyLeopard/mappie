import ThreeDotMenuIcon from "@/icons/ThreeDotMenuIcon";
import { Slash } from "lucide-react"
 
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const ProjectNavbar = () => {
    return (
        <div className="w-[100vw] flex justify-between px-3">
            {/* <div className="flex flex-row w-full justify-between space-x-96">
            <h1>Project1 /  </h1>
            <div className="flex justify-center items-center space-x-6">
                <p>Share</p>
                <div>
                    <ThreeDotMenuIcon/>
                </div>
            </div>
            
        </div> */}


<Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Project 1</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Overview</BreadcrumbLink>
        </BreadcrumbItem>
        {/* <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator> */}
      </BreadcrumbList>
    </Breadcrumb>

    <div className="flex justify-center items-center space-x-6">
                <p>Share</p>
                <div>
                    <ThreeDotMenuIcon/>
                </div>
            </div>
        </div>
    );
};

export default ProjectNavbar;