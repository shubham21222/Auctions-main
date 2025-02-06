"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ReviewInformation6() {
    const [formData, setFormData] = useState({
        category: "",
        details: {
            maker: "",
            material: "",
            caseMaterial: "",
            serialNumber: "",
            measurementUnit: "",
            heightLength: "",
            dialWidth: "",
            restoration: "",
            originalCase: "",
            originalCertificate: "",
            areasOfDamage: "",
            isWorking: "",
        },
        history: {
            ownershipHistory: "",
        },
        price: {
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
                        <p>Maker: {formData.details.maker || "N/A"}</p>
                        <p>Material: {formData.details.material || "N/A"}</p>
                        <p>Case Material: {formData.details.caseMaterial || "N/A"}</p>
                        <p>Serial Number: {formData.details.serialNumber || "N/A"}</p>
                        <p>Measurement Unit: {formData.details.measurementUnit || "N/A"}</p>
                        <p>Height/Length: {formData.details.heightLength || "N/A"}</p>
                        <p>Width/Diameter of Dial: {formData.details.dialWidth || "N/A"}</p>
                        <p>Restoration Extent: {formData.details.restoration || "N/A"}</p>
                        <p>Original Case: {formData.details.originalCase || "N/A"}</p>
                        <p>Original Certificate: {formData.details.originalCertificate || "N/A"}</p>
                        <p>Areas of Damage: {formData.details.areasOfDamage || "N/A"}</p>
                        <p>Watch Working: {formData.details.isWorking || "N/A"}</p>
                    </CardContent>
                </Card>

                {/* History & Price Section */}
                <Card className="mt-4">
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <h2 className="text-lg font-semibold">History & Price</h2>
                            <button className="text-blue-500">Edit</button>
                        </div>
                        <Separator className="my-2" />
                        <p>History of Ownership & How Acquired: {formData.history.ownershipHistory || "N/A"}</p>
                        <p>Price Paid: {formData.price.pricePaid || "N/A"}</p>
                        <p>Currency: {formData.price.currency || "N/A"}</p>
                        <p>Year Paid: {formData.price.yearPaid || "N/A"}</p>
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

                {/* Owner's Information Section */}
                <Card className="mt-4">
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <h2 className="text-lg font-semibold">Owner's Information</h2>
                            <button className="text-blue-500">Edit</button>
                        </div>
                        <Separator className="my-2" />
                        <p>First Name: {formData.owner.firstName || "N/A"}</p>
                        <p>Last Name: {formData.owner.lastName || "N/A"}</p>
                        <p>Country: {formData.owner.country || "N/A"}</p>
                        <p>Region: {formData.owner.region || "N/A"}</p>
                        <p>City: {formData.owner.city || "N/A"}</p>
                        <p>Email Address: {formData.owner.email || "N/A"}</p>
                        <p>Phone: {formData.owner.phone || "N/A"}</p>
                    </CardContent>
                </Card>

                {/* Logistics Information Section */}
                <Card className="mt-4">
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <h2 className="text-lg font-semibold">Logistics Information</h2>
                            <button className="text-blue-500">Edit</button>
                        </div>
                        <Separator className="my-2" />
                        <p>First Name: {formData.logistics.firstName || "N/A"}</p>
                        <p>Last Name: {formData.logistics.lastName || "N/A"}</p>
                        <p>Email Address: {formData.logistics.email || "N/A"}</p>
                        <p>Phone: {formData.logistics.phone || "N/A"}</p>
                    </CardContent>
                </Card>

                {/* Item Location Section */}
                <Card className="mt-4">
                    <CardContent className="p-4">
                        <div className="flex justify-between">
                            <h2 className="text-lg font-semibold">Item Location</h2>
                            <button className="text-blue-500">Edit</button>
                        </div>
                        <Separator className="my-2" />
                        <p>Country: {formData.itemLocation.country || "N/A"}</p>
                        <p>Region: {formData.itemLocation.region || "N/A"}</p>
                        <p>City: {formData.itemLocation.city || "N/A"}</p>
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