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

export default function ItemForm4({ setCurrentStep }) {
    const steps = ["Category", "Information", "Photos", "Logistics", "Review"];
    const currentStep = 2;
    const [date, setDate] = useState(null);

    return (
        <>
            <div className="flex justify-between items-center mb-8 mt-[120px]">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all ${index < currentStep
                                ? "bg-blue-500 text-white border-blue-500"
                                : "border-gray-400 text-gray-500"}`}
                        >
                            {index < currentStep ? (
                                <CheckCircle size={16} className="text-white" />
                            ) : (
                                <span className="text-sm">{index + 1}</span>
                            )}
                        </div>
                        <span className={`text-sm font-medium ${index < currentStep ? "text-blue-500" : "text-gray-500"}`}>{step}</span>
                        {index < steps.length - 1 && <div className="w-12 h-[2px] bg-gray-300"></div>}
                    </div>
                ))}
            </div>
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-center">Tell us about your item</h2>
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <h3 className="text-xl font-semibold">General</h3>
                        <Label>Item's Country of Origin</Label>
                        <Input placeholder="Item's Country of Origin" />
                        <Label>Car Make</Label>
                        <Input placeholder="Enter Car Make" />
                        <Label>Car Model</Label>
                        <Input placeholder="Enter Car Model" />
                        <Label>Year Manufactured</Label>
                        <Input placeholder="Enter Year Manufactured" type="number" />
                        <Label>What kind of transmission and how big is the engine?</Label>
                        <Textarea placeholder="Describe transmission and engine" />
                        <Label>Describe any notable or desirable options.</Label>
                        <Textarea placeholder="List notable options" />

                        <h3 className="text-xl font-semibold">Condition</h3>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="original-engine-body-chassis" />
                            <Label htmlFor="original-engine-body-chassis">The engine, body, and chassis are original to one another</Label>
                        </div>
                        <Label>Areas of Damage</Label>
                        <Textarea placeholder="Describe any damage" />
                        <Label>Has it been restored? If so, to what extent</Label>
                        <Textarea placeholder="Describe restoration details" />

                        <h3 className="text-xl font-semibold">Provenance</h3>
                        <Label>History of Ownership & How Acquired</Label>
                        <Textarea placeholder="Enter history of ownership" />
                        <Label>Appraisals / Publications / Exhibitions</Label>
                        <Textarea placeholder="Include names, dates, and locations" />

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
                                        <SelectItem value="usd">United States Dollar (USD)</SelectItem>
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
