"use client";

import { useState, useEffect } from "react";
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
      .filter((x) => x) || [],
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
    <div className="bg-linear-to-br min-h-screen from-gray-50 to-gray-100 transition-colors duration-200 dark:from-gray-900 dark:to-gray-800">
      <MainWrapper>
        <div className="space-y-8 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <Heading className="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-100">
              Select variants to print
            </Heading>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {variants.map((variant) => (
              <div
                key={variant.dbName}
                className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-700"
              >
                <Checkbox
                  checked={selected.includes(variant.dbName)}
                  onCheckedChange={(isChecked) => handleCheckboxChange(variant.dbName, isChecked as boolean)}
                  id={variant.dbName}
                  className="text-primary dark:text-primary-dark h-5 w-5 transition duration-150 ease-in-out"
                />
                <label
                  htmlFor={variant.dbName}
                  className="grow cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {variant.displayName}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg bg-gray-50 p-6 shadow-sm dark:bg-gray-700">
            <Heading className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
              Select the gap between nametags
            </Heading>
            <Slider step={1} min={0} max={10} value={[gap]} onValueChange={handleSliderChange} className="w-full" />
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Current gap: {gap}mm</div>
          </div>
          <a
            download
            href={`/api/print/nametags?roles=${selected.join(",")}&gap=${gap}&session=${params.sessionNumber}`}
            className="block w-full md:ml-auto md:w-auto"
          >
            <Button
              disabled={!selected.filter((x) => x).length}
              className="bg-primary hover:bg-primary-dark mt-4 w-full rounded-lg px-6 py-2 font-semibold text-white transition-colors duration-200"
            >
              Download
            </Button>
          </a>
        </div>
        {!!selected.filter((x) => x).length && (
          <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
            <Heading className="p-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Preview</Heading>
            <iframe
              src={`/api/print/nametags?roles=${selected.join(",")}&gap=${gap}&session=${params.sessionNumber}`}
              className="h-[600px] w-full border-t border-gray-200 dark:border-gray-700"
              title="Nametag Preview"
            />
          </div>
        )}
      </MainWrapper>
    </div>
  );
}
