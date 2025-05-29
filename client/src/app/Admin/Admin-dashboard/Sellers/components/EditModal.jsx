import React, { useState, useEffect, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

const EditModal = memo(({ 
  isOpen, 
  onClose, 
  seller, 
  onSuccess,
  token 
}) => {
  const [editForm, setEditForm] = useState({
    General: {},
    Measurement: {},
    Condition: {},
    Provenance: {},
    price: {},
    Documents: {},
    logistic_info: {},
    category: "",
  });

  // Initialize form when seller changes
  useEffect(() => {
    if (seller) {
      setEditForm({
        General: { ...seller.General },
        Measurement: { ...seller.Measurement },
        Condition: { ...seller.Condition },
        Provenance: { ...seller.Provenance },
        price: { ...seller.price },
        Documents: { ...seller.Documents },
        logistic_info: { ...seller.logistic_info },
        category: seller.category?._id || "",
      });
    }
  }, [seller]);

  const handleInputChange = (section, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Authentication required!");
      return;
    }

    try {
      const response = await fetch(
        `${config.baseURL}/v1/api/seller/update/${seller._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status) {
        toast.success("Seller updated successfully!");
        onSuccess(editForm);
        onClose();
      } else {
        throw new Error(result.message || "Failed to update seller");
      }
    } catch (error) {
      console.error("Error updating seller:", error);
      toast.error(error.message || "Failed to update seller!");
    }
  };

  if (!seller) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Seller - {seller.General?.object}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="measurement">Measurement</TabsTrigger>
              <TabsTrigger value="condition">Condition</TabsTrigger>
              <TabsTrigger value="provenance">Provenance</TabsTrigger>
              <TabsTrigger value="price">Price</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="object">Object Name</Label>
                    <Input
                      id="object"
                      value={editForm.General?.object || ""}
                      onChange={(e) => handleInputChange("General", "object", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="countryOrigin">Country of Origin</Label>
                    <Input
                      id="countryOrigin"
                      value={editForm.General?.countryOrigin || ""}
                      onChange={(e) => handleInputChange("General", "countryOrigin", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={editForm.General?.material || ""}
                      onChange={(e) => handleInputChange("General", "material", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="caseMaterial">Case Material</Label>
                    <Input
                      id="caseMaterial"
                      value={editForm.General?.caseMaterial || ""}
                      onChange={(e) => handleInputChange("General", "caseMaterial", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={editForm.General?.serialNumber || ""}
                      onChange={(e) => handleInputChange("General", "serialNumber", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="Artist">Artist</Label>
                    <Input
                      id="Artist"
                      value={editForm.General?.Artist || ""}
                      onChange={(e) => handleInputChange("General", "Artist", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carMaker">Car Maker</Label>
                    <Input
                      id="carMaker"
                      value={editForm.General?.carMaker || ""}
                      onChange={(e) => handleInputChange("General", "carMaker", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carModel">Car Model</Label>
                    <Input
                      id="carModel"
                      value={editForm.General?.carModel || ""}
                      onChange={(e) => handleInputChange("General", "carModel", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearManufactured">Year Manufactured</Label>
                    <Input
                      id="yearManufactured"
                      value={editForm.General?.yearManufactured || ""}
                      onChange={(e) => handleInputChange("General", "yearManufactured", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodOfwork">Period of Work</Label>
                    <Input
                      id="periodOfwork"
                      value={editForm.General?.periodOfwork || ""}
                      onChange={(e) => handleInputChange("General", "periodOfwork", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="measurement" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="Unit">Unit</Label>
                    <Input
                      id="Unit"
                      value={editForm.Measurement?.Unit || ""}
                      onChange={(e) => handleInputChange("Measurement", "Unit", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={editForm.Measurement?.weight || ""}
                      onChange={(e) => handleInputChange("Measurement", "weight", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="framed">Framed</Label>
                    <Input
                      id="framed"
                      value={editForm.Measurement?.framed || ""}
                      onChange={(e) => handleInputChange("Measurement", "framed", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={editForm.Measurement?.height || ""}
                      onChange={(e) => handleInputChange("Measurement", "height", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      value={editForm.Measurement?.width || ""}
                      onChange={(e) => handleInputChange("Measurement", "width", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="depth">Depth</Label>
                    <Input
                      id="depth"
                      value={editForm.Measurement?.depth || ""}
                      onChange={(e) => handleInputChange("Measurement", "depth", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="condition" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="picesInorginalcases">Pieces in Original Cases</Label>
                    <Input
                      id="picesInorginalcases"
                      value={editForm.Condition?.picesInorginalcases || ""}
                      onChange={(e) => handleInputChange("Condition", "picesInorginalcases", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="picesOriginalcertificates">Original Certificates</Label>
                    <Input
                      id="picesOriginalcertificates"
                      value={editForm.Condition?.picesOriginalcertificates || ""}
                      onChange={(e) => handleInputChange("Condition", "picesOriginalcertificates", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Signatures">Signatures</Label>
                    <Input
                      id="Signatures"
                      value={editForm.Condition?.Signatures || ""}
                      onChange={(e) => handleInputChange("Condition", "Signatures", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="AreaofDamage">Area of Damage</Label>
                    <Input
                      id="AreaofDamage"
                      value={editForm.Condition?.AreaofDamage || ""}
                      onChange={(e) => handleInputChange("Condition", "AreaofDamage", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discribeDamage">Damage Description</Label>
                    <Textarea
                      id="discribeDamage"
                      value={editForm.Condition?.discribeDamage || ""}
                      onChange={(e) => handleInputChange("Condition", "discribeDamage", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="restoration">Restoration</Label>
                    <Input
                      id="restoration"
                      value={editForm.Condition?.restoration || ""}
                      onChange={(e) => handleInputChange("Condition", "restoration", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="provenance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="historyofownership">History of Ownership</Label>
                    <Textarea
                      id="historyofownership"
                      value={editForm.Provenance?.historyofownership || ""}
                      onChange={(e) => handleInputChange("Provenance", "historyofownership", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Appraisals">Appraisals</Label>
                    <Textarea
                      id="Appraisals"
                      value={editForm.Provenance?.Appraisals || ""}
                      onChange={(e) => handleInputChange("Provenance", "Appraisals", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="price" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paidPrice">Paid Price</Label>
                    <Input
                      id="paidPrice"
                      value={editForm.price?.paidPrice || ""}
                      onChange={(e) => handleInputChange("price", "paidPrice", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={editForm.price?.currency || ""}
                      onChange={(e) => handleInputChange("price", "currency", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paidYear">Paid Year</Label>
                    <Input
                      id="paidYear"
                      value={editForm.price?.paidYear || ""}
                      onChange={(e) => handleInputChange("price", "paidYear", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Notes">Notes</Label>
                    <Textarea
                      id="Notes"
                      value={editForm.price?.Notes || ""}
                      onChange={(e) => handleInputChange("price", "Notes", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logistics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editForm.logistic_info?.firstName || ""}
                      onChange={(e) => handleInputChange("logistic_info", "firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editForm.logistic_info?.lastName || ""}
                      onChange={(e) => handleInputChange("logistic_info", "lastName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.logistic_info?.email || ""}
                      onChange={(e) => handleInputChange("logistic_info", "email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editForm.logistic_info?.phone || ""}
                      onChange={(e) => handleInputChange("logistic_info", "phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={editForm.logistic_info?.country || ""}
                      onChange={(e) => handleInputChange("logistic_info", "country", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={editForm.logistic_info?.state || ""}
                      onChange={(e) => handleInputChange("logistic_info", "state", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editForm.logistic_info?.city || ""}
                      onChange={(e) => handleInputChange("logistic_info", "city", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="samelocation">Same Location</Label>
                    <Input
                      id="samelocation"
                      value={editForm.logistic_info?.samelocation || ""}
                      onChange={(e) => handleInputChange("logistic_info", "samelocation", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="handlingshipping">Handling/Shipping</Label>
                    <Input
                      id="handlingshipping"
                      value={editForm.logistic_info?.handlingshipping || ""}
                      onChange={(e) => handleInputChange("logistic_info", "handlingshipping", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="frontImage">Front Image URL</Label>
                    <Input
                      id="frontImage"
                      value={editForm.Documents?.frontImage || ""}
                      onChange={(e) => handleInputChange("Documents", "frontImage", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="backImage">Back Image URL</Label>
                    <Input
                      id="backImage"
                      value={editForm.Documents?.backImage || ""}
                      onChange={(e) => handleInputChange("Documents", "backImage", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="detailImage">Detail Image URL</Label>
                    <Input
                      id="detailImage"
                      value={editForm.Documents?.detailImage || ""}
                      onChange={(e) => handleInputChange("Documents", "detailImage", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="MakermarkImg">Maker Mark Image URL</Label>
                    <Input
                      id="MakermarkImg"
                      value={editForm.Documents?.MakermarkImg || ""}
                      onChange={(e) => handleInputChange("Documents", "MakermarkImg", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="DamageImage">Damage Image URL</Label>
                    <Input
                      id="DamageImage"
                      value={editForm.Documents?.DamageImage || ""}
                      onChange={(e) => handleInputChange("Documents", "DamageImage", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="DocumentationImg">Documentation Image URL</Label>
                    <Input
                      id="DocumentationImg"
                      value={editForm.Documents?.DocumentationImg || ""}
                      onChange={(e) => handleInputChange("Documents", "DocumentationImg", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

EditModal.displayName = 'EditModal';

export default EditModal; 