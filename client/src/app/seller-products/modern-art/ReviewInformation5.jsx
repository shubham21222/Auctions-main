"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ReviewInformation5() {
    const [formData, setFormData] = useState({
        category: "",
        details: {
            maker: "",
            material: "",
            caseMaterial: "",
            serialNumber: "",
            measurementUnit: "",
            heightLength: "",
            widthDiameterOfDial: "",
            restoredExtent: "",
            originalCase: "",
            originalCertificate: "",
            areasOfDamage: "",
            isWorking: "",
            ownershipHistory: "",
            pricePaid: "",
            currency: "USD",
            yearPaid: "",
        },
        additionalDetails: "",
        images: "",
        owner: {
            firstName: "",
            lastName: "",
            country: "",
            region: "",
            city: "",
            email: "",
            phone: "",
        },
        logistics: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
        },
        itemLocation: {
            country: "",
            region: "",
            city: "",
        },
    });

    const steps = ["Category", "Information", "Photos", "Logistics", "Review"];
    const currentStep = 5;

    return (
        <>
            <div className="hidden sm:flex justify-between mt-[80px] items-center mb-8">
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
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-center mb-6">Review Information</h1>

                {/* Category Section */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <h2 className="text-lg font-semibold">Category</h2>
                            <button className="text-blue-500">Edit</button>
                        </div>
                        <Separator className="my-2" />
                        <p>Category: {formData.category || "N/A"}</p>
                    </CardContent>
                </Card>

                {/* Details Section */}
                <Card className="mt-4">
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <h2 className="text-lg font-semibold">Details</h2>
                            <button className="text-blue-500">Edit</button>
                        </div>
                        <Separator className="my-2" />
                        {Object.entries(formData.details).map(([key, value]) => (
                            <p key={key} className="capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}: {value || "N/A"}
                            </p>
                        ))}
                    </CardContent>
                </Card>

                {/* Images & Documents Section */}
                <Card className="mt-4">
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <h2 className="text-lg font-semibold">Images & Documents</h2>
                            <button className="text-blue-500">Edit</button>
                        </div>
                        <Separator className="my-2" />
                        <p>Photos: {formData.images || "N/A"}</p>
                    </CardContent>
                </Card>

                {/* Logistics Section */}
                <Card className="mt-4">
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <h2 className="text-lg font-semibold">Logistics</h2>
                            <button className="text-blue-500">Edit</button>
                        </div>
                        <Separator className="my-2" />
                        <h3 className="font-semibold mt-2">Owner's Information</h3>
                        {Object.entries(formData.owner).map(([key, value]) => (
                            <p key={key} className="capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}: {value || "N/A"}
                            </p>
                        ))}
                        <h3 className="font-semibold mt-4">Logistics Information</h3>
                        {Object.entries(formData.logistics).map(([key, value]) => (
                            <p key={key} className="capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}: {value || "N/A"}
                            </p>
                        ))}
                        <h3 className="font-semibold mt-4">Item Location</h3>
                        {Object.entries(formData.itemLocation).map(([key, value]) => (
                            <p key={key} className="capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}: {value || "N/A"}
                            </p>
                        ))}
                    </CardContent>
                </Card>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline">Back</Button>
                    <Button>Submit</Button>
                </div>
            </div>
        </>
    );
}