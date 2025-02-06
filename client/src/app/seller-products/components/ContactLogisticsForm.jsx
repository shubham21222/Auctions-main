'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const ContactLogisticsForm = ({ setCurrentStep }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log('Form Data:', data);
        setCurrentStep(5); // Move to next step
    };
    const steps = ["Category", "Information", "Photos", "Logistics", "Review"];
    const currentStep = 4; // Hardcoded to 2 since this is the Information step

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
                <h1 className="text-2xl font-semibold text-center mb-6">
                    Share contact and logistics information
                </h1>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium">First Name</label>
                                <Input {...register('firstName', { required: 'First name is required' })} />
                                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                            </div>
                            <div>
                                <label className="block font-medium">Last Name</label>
                                <Input {...register('lastName', { required: 'Last name is required' })} />
                                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block font-medium">Email Address</label>
                                <Input type="email" {...register('email', { required: 'Email is required' })} />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className="block font-medium">Region</label>
                                <select
                                    {...register('region', { required: 'Region is required' })}
                                    className="border rounded w-full p-2"
                                >
                                    <option value="">Select Region</option>
                                    <option value="North">North</option>
                                    <option value="South">South</option>
                                    <option value="East">East</option>
                                    <option value="West">West</option>
                                </select>
                                {errors.region && <p className="text-red-500 text-sm">{errors.region.message}</p>}
                            </div>
                            <div>
                                <label className="block font-medium">City</label>
                                <Input {...register('city', { required: 'City is required' })} />
                                {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                            </div>
                            <div>
                                <label className="block font-medium">Country</label>
                                <select
                                    {...register('country', { required: 'Country is required' })}
                                    className="border rounded w-full p-2"
                                >
                                    <option value="">Select Country</option>
                                    <option value="USA">USA</option>
                                    <option value="Canada">Canada</option>
                                    <option value="UK">UK</option>
                                </select>
                                {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
                            </div>
                            <div>
                                <label className="block font-medium">Phone</label>
                                <Input {...register('phone', { required: 'Phone is required' })} />
                                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register('sameLocation')} />
                            Is the item in the same location as the owner?
                        </label>
                        <label className="flex items-center gap-2 mt-2">
                            <input type="checkbox" {...register('contactPerson')} />
                            Contact this person regarding shipping and handling of the item
                        </label>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                        <Button type="submit">Continue</Button>
                    </div>

                    <p className="text-center mt-3 text-sm text-gray-500">
                        Click "continue" to save your progress for this step
                    </p>
                </form>
            </div>
        </>
    );
};

export default ContactLogisticsForm;
