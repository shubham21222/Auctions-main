"use client";
import { useState } from "react";
import { ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const steps = ["Category", "Information", "Photos", "Logistics", "Review"];
const categories = [
    { name: "Fine Art", img: "/fine-art.png" },
    { name: "Watches", img: "/watches.png" },
    { name: "Jewelry", img: "/jewelry.png" },
    { name: "Fashion", img: "/fashion.png" },
    { name: "Automotives", img: "/automotives.png" },
    { name: "Modern Art", img: "/modern-art.png" },
    { name: "Trading Cards", img: "/trading-card.png" },
];

export default function StepperForm({ selectedCategory, setSelectedCategory, setCurrentStep }) {
    const [currentStep, setLocalCurrentStep] = useState(1);
    const progressValue = (currentStep / steps.length) * 100;

    const handleContinue = () => {
        if ((selectedCategory === "Fine Art" || selectedCategory === "Watches" || selectedCategory === "Jewelry" || selectedCategory === "Fashion" || selectedCategory === "Modern Art" || selectedCategory === "Trading Cards" || selectedCategory === "Automotives") && currentStep === 1) {
            setCurrentStep(2);
        }
    };

    return (
        <div className="max-w-3xl  mx-auto p-3 sm:p-6 mt-4 sm:mt-[60px]">
            {/* Progress Bar */}
            <div className="mb-4 sm:mb-8">
                <Progress value={progressValue} className="h-2" />
            </div>

            {/* Stepper */}
            <div className="hidden sm:flex justify-between items-center mb-8">
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

            {/* Title */}
            <h2 className="text-center text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
                Choose your category
            </h2>

            {/* Category List */}
            <div className="space-y-3 sm:space-y-4">
                {categories.map((category, index) => (
                    <Card
                        key={index}
                        className={`p-3 sm:p-4 cursor-pointer transition-all ${
                            selectedCategory === category.name
                                ? "border-blue-500 bg-blue-100"
                                : "hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedCategory(category.name)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                    <AvatarImage src={category.img} alt={category.name} />
                                </Avatar>
                                <span className="text-base sm:text-lg font-medium">{category.name}</span>
                            </div>
                            {selectedCategory === category.name ? (
                                <CheckCircle className="text-blue-500 h-5 w-5 sm:h-6 sm:w-6" />
                            ) : (
                                <ChevronRight className="text-gray-500 h-5 w-5 sm:h-6 sm:w-6" />
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Continue Button */}
            <div className="text-center mt-6 sm:mt-8">
                <Button 
                    className="w-full sm:w-auto bg-black text-white" 
                    onClick={handleContinue} 
                    disabled={!selectedCategory}
                >
                    Continue
                </Button>
                <p className="text-xs mt-2 text-gray-500">
                    Click "Continue" to save your progress for this step
                </p>
            </div>
        </div>
    );
}