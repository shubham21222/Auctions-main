"use client";

import { useState } from "react";
import StepperForm from "./components/StepperForm";
import ItemForm from "./components/ItemForm";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UploadPhotosDocuments from "./components/UploadPhotosDocuments";
import ContactLogisticsForm from "./components/ContactLogisticsForm";
import ReviewInformation from "./components/ReviewInformation";
import { Toaster } from "react-hot-toast";

export default function Home() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({});

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
                <div className="max-w-6xl mx-auto p-6">
                    {/* <Toaster position="top-right" /> */}
                    {currentStep === 1 && (
                        <StepperForm
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            setCurrentStep={setCurrentStep}
                            setFormData={setFormData}
                        />
                    )}
                    {currentStep === 2 && (
                        <ItemForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                    {currentStep === 3 && (
                        <UploadPhotosDocuments
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                    {currentStep === 4 && (
                        <ContactLogisticsForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                    {currentStep === 5 && (
                        <ReviewInformation
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}