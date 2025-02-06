"use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const categories = ["Fine Art", "Watches", "Jewelry", "Fashion", "Automotives"];

export default function ItemForm({ setCurrentStep, selectedCategory }) {
    const [formData, setFormData] = useState({
        country: "",
        designer: "",
        object: "",
        material: "",
        date: "",
        framed: false,
        framedHeight: "",
        framedWidth: "",
        framedDepth: "",
        unframedHeight: "",
        unframedWidth: "",
        unframedDepth: "",
        condition: "",
        damage: "",
        restoration: "",
        ownership: "",
        appraisals: "",
        price: "",
        currency: "USD",
        yearPaid: "",
        notes: "",
    });

    const steps = ["Category", "Information", "Photos", "Logistics", "Review"];
    const currentStep = 2; // Hardcoded to 2 since this is the Information step

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Calculate progress based on the step
    const progressValue = 50; // Since this is step 2 out of 5

    return (
        <div className="max-w-3xl mx-auto mt-[80px] p-4 sm:p-6 space-y-6">
            {/* Progress Bar */}
            <div className="mb-8">
                <Progress value={progressValue} className="h-2" />
            </div>

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

            {/* Show form only if "Fine Art" is selected */}
            {selectedCategory === "Fine Art" && (
                <div className="mt-6 p-4 sm:p-6 border rounded-lg shadow-md">
                    <h2 className="text-xl sm:text-2xl font-semibold text-center">
                        Tell us about your item
                    </h2>

                    {/* General Section */}
                    <div className="space-y-4 mt-4">
                        <h3 className="text-lg sm:text-xl font-medium">General</h3>
                        <Input name="country" value={formData.country} placeholder="Item's Country of Origin" onChange={handleChange} />
                        <Input name="designer" value={formData.designer} placeholder="Designer / Maker" onChange={handleChange} />
                        <Textarea name="object" value={formData.object} placeholder="What is the object?" onChange={handleChange} />
                        <Input name="material" value={formData.material} placeholder="Medium / Material" onChange={handleChange} />
                        <Input name="date" value={formData.date} placeholder="Date of Work (MM-DD-YYYY)" onChange={handleChange} />
                    </div>

                    {/* Measurements Section */}
                    <div className="space-y-4 mt-4">
                        <h3 className="text-lg sm:text-xl font-medium">Measurements</h3>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="framed"
                                checked={formData.framed}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, framed: checked }))}
                            />
                            <label htmlFor="framed">Yes, it is framed</label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            <Input name="framedHeight" value={formData.framedHeight} placeholder="Framed Height" onChange={handleChange} />
                            <Input name="framedWidth" value={formData.framedWidth} placeholder="Framed Width" onChange={handleChange} />
                            <Input name="framedDepth" value={formData.framedDepth} placeholder="Framed Depth" onChange={handleChange} />
                            <Input name="unframedHeight" value={formData.unframedHeight} placeholder="Unframed Height" onChange={handleChange} />
                            <Input name="unframedWidth" value={formData.unframedWidth} placeholder="Unframed Width" onChange={handleChange} />
                            <Input name="unframedDepth" value={formData.unframedDepth} placeholder="Unframed Depth" onChange={handleChange} />
                        </div>
                    </div>

                    {/* Condition Section */}
                    <div className="space-y-4 mt-4">
                        <h3 className="text-lg sm:text-xl font-medium">Condition</h3>
                        <Input name="condition" value={formData.condition} placeholder="Signatures, Labels or Markings" onChange={handleChange} />
                        <Input name="damage" value={formData.damage} placeholder="Areas of Damage" onChange={handleChange} />
                        <Input name="restoration" value={formData.restoration} placeholder="Has it been restored?" onChange={handleChange} />
                    </div>

                    {/* Provenance Section */}
                    <div className="space-y-4 mt-4">
                        <h3 className="text-lg sm:text-xl font-medium">Provenance</h3>
                        <Input name="ownership" value={formData.ownership} placeholder="History of Ownership & How Acquired" onChange={handleChange} />
                        <Textarea name="appraisals" value={formData.appraisals} placeholder="Appraisals / Publications / Exhibitions" onChange={handleChange} />
                    </div>

                    {/* Price Section */}
                    <div className="space-y-4 mt-4">
                        <h3 className="text-lg sm:text-xl font-medium">Price</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            <Input name="price" value={formData.price} placeholder="Price Paid" onChange={handleChange} />
                            <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))} value={formData.currency}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">United States Dollar</SelectItem>
                                    <SelectItem value="EUR">Euro</SelectItem>
                                    <SelectItem value="GBP">British Pound</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input name="yearPaid" value={formData.yearPaid} placeholder="Year Paid" onChange={handleChange} />
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-4 mt-4">
                        <h3 className="text-lg sm:text-xl font-medium">Notes</h3>
                        <Textarea name="notes" value={formData.notes} placeholder="Additional Details" onChange={handleChange} />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                        <Button variant="outline" onClick={() => setCurrentStep(1)} className="w-full sm:w-auto">
                            Back
                        </Button>
                        <Button onClick={() => setCurrentStep(3)} className="w-full sm:w-auto">
                            Continue
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}