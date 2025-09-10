"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { updateSearchParams } from "@/lib/search-params";
import { useParams, useSearchParams } from "next/navigation";
import { MainWrapper } from "@/components/main-wrapper";

export function VariantPicker() {
	const variants = [
		{ dbName: "Director", displayName: "Directors" },
		{ dbName: "seniorDirector", displayName: "Senior Directors" },
		{ dbName: "delegate", displayName: "Delegates" },
		{ dbName: "chair", displayName: "Chairs" },
		{ dbName: "member", displayName: "Members" },
		{ dbName: "manager", displayName: "Managers" },
		{ dbName: "schoolDirector", displayName: "School Directors" },
		{ dbName: "secretaryGeneral", displayName: "Secretary Generals" },
		{ dbName: "deputySecretaryGeneral", displayName: "Deputy Secretary Generals" },
		{ dbName: "presidentOfTheGeneralAssembly", displayName: "President of the General Assembly" },
		{ dbName: "deputyPresidentOfTheGeneralAssembly", displayName: "Deputy President of the General Assembly" },
	];

	const params = useParams();
	const searchParams = useSearchParams();
	const [selected, setSelected] = useState(
		searchParams
			?.get("roles")
			?.split(",")
			.filter((x) => x) || []
	);
	const [gap, setGap] = useState(searchParams?.get("gap") ? Number.parseInt(searchParams.get("gap") as string) : 0);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleCheckboxChange = (dbName: string, isChecked: boolean) => {
		const newSelected = isChecked ? [...selected, dbName] : selected.filter((x) => x !== dbName);
		setSelected(newSelected);
		updateSearchParams({ roles: newSelected.join(",") });
	};

	const handleSliderChange = (value: number[]) => {
		setGap(value[0]);
		updateSearchParams({ gap: value[0].toString() });
	};

	if (!mounted) return null;

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
			<MainWrapper>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-200">
					<div className="flex justify-between items-center">
						<Heading className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Select variants to print</Heading>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{variants.map((variant) => (
							<motion.div
								key={variant.dbName}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
								<Checkbox
									checked={selected.includes(variant.dbName)}
									onCheckedChange={(isChecked) => handleCheckboxChange(variant.dbName, isChecked as boolean)}
									id={variant.dbName}
									className="h-5 w-5 text-primary dark:text-primary-dark transition duration-150 ease-in-out"
								/>
								<label htmlFor={variant.dbName} className="grow text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
									{variant.displayName}
								</label>
							</motion.div>
						))}
					</div>
					<div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
						<Heading className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Select the gap between nametags</Heading>
						<Slider step={1} min={0} max={10} value={[gap]} onValueChange={handleSliderChange} className="w-full" />
						<div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Current gap: {gap}mm</div>
					</div>
					<a
						download
						href={`/api/print/nametags?roles=${selected.join(",")}&gap=${gap}&session=${params.sessionNumber}`}
						className="block w-full md:w-auto md:ml-auto">
						<Button
							disabled={!selected.filter((x) => x).length}
							className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 mt-4 px-6 rounded-lg transition-colors duration-200">
							Download
						</Button>
					</a>
				</motion.div>
				{!!selected.filter((x) => x).length && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
						<Heading className="text-2xl font-bold text-gray-800 dark:text-gray-100 p-6">Preview</Heading>
						<iframe
							src={`/api/print/nametags?roles=${selected.join(",")}&gap=${gap}&session=${params.sessionNumber}`}
							className="w-full h-[600px] border-t border-gray-200 dark:border-gray-700"
							title="Nametag Preview"
						/>
					</motion.div>
				)}
			</MainWrapper>
		</div>
	);
}
