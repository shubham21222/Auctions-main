"use client";

import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL"; 
const UploadBox = ({ label, setFormData, token }) => {
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

    const onDrop = useCallback(
        async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) {
                toast.error("No file selected!");
                return;
            }

            console.log("File details:", {
                name: file.name,
                type: file.type, // Log the MIME type
                size: file.size,
            });

            const formData = new FormData();
            formData.append("image", file); // Use "image" key as confirmed

            try {
                const response = await fetch(`${config.baseURL}/v1/api/uploadImg/upload-multiple`, {
                    method: "POST",
                    headers: {
                        Authorization: `${token}`,
                    },
                    body: formData,
                });

                const result = await response.json();
                console.log("Upload response:", result); // Debug the response

                if (response.ok && result.status && result.subCode === 200) {
                    const imageUrl = result.items.imageUrls[0]; // Take the first URL
                    setUploadedImageUrl(imageUrl);
                    setFormData((prev) => ({
                        ...prev,
                        Documents: {
                            ...prev.Documents,
                            [`${label.toLowerCase()}Image`]: imageUrl,
                        },
                    }));
                    toast.success(`${label} uploaded successfully!`);
                } else {
                    toast.error("Upload failed: " + (result.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Something went wrong while uploading!");
            }
        },
        [label, setFormData, token]
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/gif": [".gif"],
        }, // Stricter MIME type and extension mapping
        multiple: false,
    });

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-all"
            >
                <input {...getInputProps()} />
                <p className="text-gray-500">Click or drag and drop an image (JPEG, PNG, GIF) to upload</p>
                <p className="font-semibold text-blue-600">{label}</p>
            </div>
            {uploadedImageUrl && (
                <div className="mt-4">
                    <p className="text-gray-600 font-semibold">Uploaded {label}:</p>
                    <img src={uploadedImageUrl} alt={label} className="w-32 h-32 object-cover rounded-lg mt-2" />
                </div>
            )}
        </div>
    );
};

export default function UploadPhotosDocuments({ setCurrentStep, formData, setFormData }) {
    const steps = ["Category", "Information", "Photos", "Logistics", "Review"];
    const currentStep = 3;

    const token = useSelector((state) => state.auth?.token);

    if (!token) {
        toast.error("Authentication required! Please log in.");
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Upload Photos and Documents</h1>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                    <UploadBox label="Front" setFormData={setFormData} token={token} />
                </div>
                <UploadBox label="Back" setFormData={setFormData} token={token} />
                <UploadBox label="Detail" setFormData={setFormData} token={token} />
                <UploadBox label="Maker's Mark" setFormData={setFormData} token={token} />
                <UploadBox label="Damage" setFormData={setFormData} token={token} />
                <UploadBox label="Documents" setFormData={setFormData} token={token} />
            </div>
            <div className="flex justify-between mt-10">
                <button
                    className="px-6 py-3 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition-all"
                    onClick={() => setCurrentStep(2)}
                >
                    Back
                </button>
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
                    onClick={() => setCurrentStep(4)}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}