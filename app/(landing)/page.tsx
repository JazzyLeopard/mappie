"use client";

import React, { useEffect } from "react";
import { Heading } from "./_components/Heading";

const LandingPage = () => {
	return (
		<div className="pt-20 min-h-full flex flex-col">
			<div
				className="flex flex-col items-center justify-center
                            md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
				<Heading />
			</div>
		</div>
	);
};

export default LandingPage;
