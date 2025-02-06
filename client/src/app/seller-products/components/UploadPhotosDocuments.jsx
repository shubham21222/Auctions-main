'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const UploadBox = ({ label }) => {
    const onDrop = useCallback((acceptedFiles) => {
        console.log(`${label} uploaded:`, acceptedFiles);
    }, [label]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/jpeg, image/png, image/gif',
    });



    return (
        <Card className="border-dashed border-2 border-gray-300 flex items-center justify-center p-6 w-full min-h-[150px] text-center cursor-pointer">
            <CardContent {...getRootProps()} className="flex flex-col items-center justify-center gap-2">
                <input {...getInputProps()} />
                <span className="text-gray-500">Click or drag and drop on image to upload</span>
                <span className="font-medium text-sm">{label}</span>
            </CardContent>
        </Card>
    );
};

const UploadPhotosDocuments = ({ setCurrentStep }) => {

    const steps = ["Category", "Information", "Photos", "Logistics", "Review"];
    const currentStep = 3; // Hardcoded to 2 since this is the Information step

    return (
        <>
             <div className="hidden sm:flex justify-between items-center mb-8 mt-[80px]">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all ${
                                            index < currentStep
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "border-gray-400 text-gray-500"
                                        }`}
                                    >
                                        {index < currentStep ? (
                                            <CheckCircle size={16} className="text-white" />
                                        ) : (
                                            <span className="text-sm">{index + 1}</span>
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${
                                            index < currentStep ? "text-blue-500" : "text-gray-500"
                                        }`}
                                    >
                                        {step}
                                    </span>
                                    {index < steps.length - 1 && <div className="w-12 h-[2px] bg-gray-300"></div>}
                                </div>
                            ))}
                        </div>
            
                        {/* Mobile Stepper */}
                        <div className="flex sm:hidden justify-between items-center mb-6">
                            {steps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <div
                                        className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all ${
                                            index < currentStep
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "border-gray-400 text-gray-500"
                                        }`}
                                    >
                                        {index < currentStep ? (
                                            <CheckCircle size={12} className="text-white" />
                                        ) : (
                                            <span className="text-xs">{index + 1}</span>
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs font-medium mt-1 ${
                                            index < currentStep ? "text-blue-500" : "text-gray-500"
                                        }`}
                                    >
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-semibold text-center mb-6">Upload Photos and Documents</h1>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <UploadBox label="Front" />
                    </div>
                    <UploadBox label="Back" />
                    <UploadBox label="Detail" />
                    <UploadBox label="Maker's Mark" />
                    <UploadBox label="Damage" />
                    <UploadBox label="Documents" />
                </div>
                <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                    <Button onClick={() => setCurrentStep(4)}>Continue</Button>
                </div>
            </div>
        </>
    );
};

export default UploadPhotosDocuments;
