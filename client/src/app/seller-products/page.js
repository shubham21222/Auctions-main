"use client";

import { useState, useEffect } from "react";
import StepperForm from "./components/StepperForm";
import ModernArtItemForm from "./components/ModernArtItemForm";
import JewelryItemForm from "./components/JewelryItemForm";
import FineArtItemForm from "./components/FineArtItemForm";
import FashionItemForm from "./components/FashionItemForm";
import AutomotivesItemForm from "./components/AutomotivesItemForm";
import OthersItemForm from "./components/OthersItemForm";
import UploadPhotosDocuments from "./components/UploadPhotosDocuments";
import ContactLogisticsForm from "./components/ContactLogisticsForm";
import ReviewInformation from "./components/ReviewInformation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";
import config from "@/app/config_BASE_URL";
// Map category names to their ItemForm components
const formMap = {
  "OTHERS": OthersItemForm,
  "MODERN ART": ModernArtItemForm,
  "JEWELRY": JewelryItemForm,
  "FINE ART": FineArtItemForm,
  "FASHION": FashionItemForm,
  "AUTOMOTIVES": AutomotivesItemForm,
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null); // Stores category _id
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]); // Store fetched categories
  const [categoryForms, setCategoryForms] = useState({}); // Dynamic categoryForms

  // Fetch categories from API on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${config.baseURL}/v1/api/category/all`);
        const data = await response.json();
        if (data.status) {
          setCategories(data.items);
          // Dynamically create categoryForms based on fetched categories
          const dynamicCategoryForms = data.items.reduce((acc, category) => {
            const itemForm = formMap[category.name];
            if (itemForm) {
              acc[category._id] = { itemForm };
            }
            return acc;
          }, {});
          setCategoryForms(dynamicCategoryForms);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories!");
      }
    };
    fetchCategories();
  }, []);

  const SelectedItemForm = selectedCategory && categoryForms[selectedCategory]?.itemForm;

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="w-full max-w-6xl mx-auto p-6">
          {/* <Toaster position="top-right" /> */}
          {currentStep === 1 && (
            <StepperForm
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setCurrentStep={setCurrentStep}
              setFormData={setFormData}
              categories={categories} // Pass fetched categories to StepperForm
            />
          )}
          {currentStep === 2 && SelectedItemForm ? (
            <SelectedItemForm
              setCurrentStep={setCurrentStep}
              selectedCategory={selectedCategory}
              formData={formData}
              setFormData={setFormData}
            />
          ) : currentStep === 2 ? (
            <div className="text-red-500 text-center">
              Invalid category selected: &quot;{selectedCategory}&quot; - Please go back and choose a valid category.
            </div>
          ) : null}
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