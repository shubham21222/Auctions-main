import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import Image from 'next/image';

const SellerDetailsModal = ({ seller, isOpen, onClose, onEdit, onDelete }) => {
  if (!seller) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Seller Details - {seller.General?.object}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="details">Item Details</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge variant={seller.Approved ? "success" : "warning"}>
                      {seller.Approved ? "Approved" : "Pending"}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Category:</span> {seller.category?.name}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {format(new Date(seller.createdAt), "PPpp")}
                  </p>
                  <p>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {format(new Date(seller.updatedAt), "PPpp")}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Seller Information</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {seller.createdBy?.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {seller.createdBy?.email}
                  </p>
                  {seller.ApprovedBy && (
                    <p>
                      <span className="font-medium">Approved By:</span>{" "}
                      {seller.ApprovedBy.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">General Details</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(seller.General || {}).map(([key, value]) => (
                    value && (
                      <p key={key}>
                        <span className="font-medium">{key}:</span> {value}
                      </p>
                    )
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Measurements & Condition</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(seller.Measurement || {}).map(([key, value]) => (
                    value && (
                      <p key={key}>
                        <span className="font-medium">{key}:</span> {value}
                      </p>
                    )
                  ))}
                  {Object.entries(seller.Condition || {}).map(([key, value]) => (
                    value && (
                      <p key={key}>
                        <span className="font-medium">{key}:</span> {value}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>
            {seller.Provenance && Object.values(seller.Provenance).some(Boolean) && (
              <div>
                <h3 className="font-semibold mb-2">Provenance</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(seller.Provenance).map(([key, value]) => (
                    value && (
                      <p key={key}>
                        <span className="font-medium">{key}:</span> {value}
                      </p>
                    )
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logistics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {`${seller.logistic_info?.firstName} ${seller.logistic_info?.lastName}`}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {seller.logistic_info?.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {seller.logistic_info?.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {seller.logistic_info?.country}
                  </p>
                  <p>
                    <span className="font-medium">State:</span>{" "}
                    {seller.logistic_info?.state || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">City:</span>{" "}
                    {seller.logistic_info?.city}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Shipping Information</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Same Location:</span>{" "}
                  {seller.logistic_info?.samelocation}
                </p>
                <p>
                  <span className="font-medium">Handling/Shipping:</span>{" "}
                  {seller.logistic_info?.handlingshipping}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {seller.Documents?.frontImage && (
                <div>
                  <h3 className="font-semibold mb-2">Front Image</h3>
                  <div className="relative h-64 w-full">
                    <Image
                      src={seller.Documents.frontImage}
                      alt="Front"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}
              {seller.Documents?.backImage && (
                <div>
                  <h3 className="font-semibold mb-2">Back Image</h3>
                  <div className="relative h-64 w-full">
                    <Image
                      src={seller.Documents.backImage}
                      alt="Back"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
            {seller.Documents?.detailImage && (
              <div>
                <h3 className="font-semibold mb-2">Detail Image</h3>
                <div className="relative h-64 w-full">
                  <Image
                    src={seller.Documents.detailImage}
                    alt="Detail"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => onEdit(seller)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Seller
          </button>
          <button
            onClick={() => onDelete(seller._id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Seller
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellerDetailsModal; 