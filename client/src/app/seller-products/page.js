'use client';

import { useState } from "react";
import StepperForm from "./components/StepperForm";
import ItemForm from "./components/ItemForm";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UploadPhotosDocuments from "./components/UploadPhotosDocuments";
import ContactLogisticsForm from "./components/ContactLogisticsForm";
import ReviewInformation from "./components/ReviewInformation";
import ItemForm2 from "./Watches/ItemForm";
import ReviewInformation2 from "./Watches/ReviewInformation2";
import ItemForm3 from "./fashion/ItemForm3";
import ReviewInformation3 from "./fashion/ReviewInformation3";
import ItemForm4 from "./automotive/ItemForm4";
import ReviewInformation4 from "./automotive/ReviewInformation4";
import ItemForm5 from "./modern-art/ItemForm5";
import ReviewInformation5 from "./modern-art/ReviewInformation5";
import ItemForm6 from "./trading-cards/ItemForm6";
import ReviewInformation6 from "./trading-cards/ReviewInformation6";

export default function Home() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-3xl mx-auto p-6">
                    {currentStep === 1 && (
                        <StepperForm
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            setCurrentStep={setCurrentStep}
                        />
                    )}

                    {currentStep === 2 && selectedCategory === "Fine Art" && (
                        <ItemForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 3 && selectedCategory === "Fine Art" && (
                        <UploadPhotosDocuments
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 4 && selectedCategory === "Fine Art" && (
                        <ContactLogisticsForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 5 && selectedCategory === "Fine Art" && (
                        <ReviewInformation
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 2 && selectedCategory === "Watches" && (
                        <ItemForm2
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 3 && selectedCategory === "Watches" && (
                        <UploadPhotosDocuments
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 4 && selectedCategory === "Watches" && (
                        <ContactLogisticsForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 5 && selectedCategory === "Watches" && (
                        <ReviewInformation2
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 2 && selectedCategory === "Jewelry" && (
                        <ItemForm2
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 3 && selectedCategory === "Jewelry" && (
                        <UploadPhotosDocuments
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 4 && selectedCategory === "Jewelry" && (
                        <ContactLogisticsForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 5 && selectedCategory === "Jewelry" && (
                        <ReviewInformation2
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 2 && selectedCategory === "Fashion" && (
                        <ItemForm3
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 3 && selectedCategory === "Fashion" && (
                        <UploadPhotosDocuments
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 4 && selectedCategory === "Fashion" && (
                        <ContactLogisticsForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 5 && selectedCategory === "Fashion" && (
                        <ReviewInformation3
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 2 && selectedCategory === "Automotives" && (
                        <ItemForm4
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 3 && selectedCategory === "Automotives" && (
                        <UploadPhotosDocuments
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 4 && selectedCategory === "Automotives" && (
                        <ContactLogisticsForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 5 && selectedCategory === "Automotives" && (
                        <ReviewInformation4
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 2 && selectedCategory === "Modern Art" && (
                        <ItemForm5
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 3 && selectedCategory === "Modern Art" && (
                        <UploadPhotosDocuments
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 4 && selectedCategory === "Modern Art" && (
                        <ContactLogisticsForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 5 && selectedCategory === "Modern Art" && (
                        <ReviewInformation5
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 2 && selectedCategory === "Trading Cards" && (
                        <ItemForm6
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 3 && selectedCategory === "Trading Cards" && (
                        <UploadPhotosDocuments
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {currentStep === 4 && selectedCategory === "Trading Cards" && (
                        <ContactLogisticsForm
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}


                    {currentStep === 5 && selectedCategory === "Trading Cards" && (
                        <ReviewInformation6
                            setCurrentStep={setCurrentStep}
                            selectedCategory={selectedCategory}
                        />
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
