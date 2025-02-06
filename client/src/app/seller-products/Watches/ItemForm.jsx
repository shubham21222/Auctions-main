'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function ItemForm2({ setCurrentStep }) {
  const steps = ["Category", "Information", "Photos", "Logistics", "Review"];
  const currentStep = 2; // Hardcoded to 2 since this is the Information step
  const [date, setDate] = useState(null);

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
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center">Tell us about your item</h2>

        <Card>
          <CardContent className="space-y-4 p-6">
            {/* General Section */}
            <h3 className="text-xl font-semibold">General</h3>
            <Label>Maker</Label>
            <Input placeholder="Enter maker" />
            <Label>Reference Number</Label>
            <Input placeholder="Enter reference number" />
            <Label>Material</Label>
            <Input placeholder="Enter material" />
            <Label>What is the material of the case?</Label>
            <Input placeholder="Enter case material" />
            <Label>Serial Number</Label>
            <Input placeholder="Enter serial number" />
            <Label>Date of Piece</Label>
            <Calendar selected={date} onSelect={setDate} />

            {/* Dimensions Section */}
            <h3 className="text-xl font-semibold">Dimensions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Height/Length</Label>
                <Input placeholder="Enter height/length" />
              </div>
              <div>
                <Label>Width/Diameter of Dial</Label>
                <Input placeholder="Enter width/diameter" />
              </div>
            </div>

            {/* Condition Section */}
            <h3 className="text-xl font-semibold">Condition</h3>
            <Label>Has it been restored? If so, to what extent?</Label>
            <Textarea placeholder="Describe restoration" />
            <div className="flex items-center space-x-2">
              <Checkbox id="original-case" />
              <Label htmlFor="original-case">Piece is in its original case</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="original-certificate" />
              <Label htmlFor="original-certificate">Piece has original certificate</Label>
            </div>
            <Label>Areas of Damage</Label>
            <Textarea placeholder="Describe any damage" />
            <div className="flex items-center space-x-2">
              <Checkbox id="working-status" />
              <Label htmlFor="working-status">Watch is working</Label>
            </div>

            {/* Provenance Section */}
            <h3 className="text-xl font-semibold">Provenance</h3>
            <Label>History of Ownership & How Acquired</Label>
            <Textarea placeholder="Enter history of ownership" />

            {/* Price Section */}
            <h3 className="text-xl font-semibold">Price</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Price Paid</Label>
                <Input placeholder="Enter price" type="number" />
              </div>
              <div>
                <Label>Currency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">United States Dollar</SelectItem>
                    <SelectItem value="eur">Euro</SelectItem>
                    <SelectItem value="gbp">British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year Paid</Label>
                <Input placeholder="Enter year paid" type="number" />
              </div>
            </div>

            <h3 className="text-xl font-semibold">Notes</h3>
            <Label>Additional Details</Label>
            <Textarea placeholder="Enter any additional details" />

            <div className="flex justify-between mt-6">
              <Button onClick={() => setCurrentStep(1)} variant="outline">Back</Button>
              <Button onClick={() => setCurrentStep(3)}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}