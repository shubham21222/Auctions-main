"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";

export default function EditCategoryDialog({ category, fetchCategories }) {
  const [updatedCategory, setUpdatedCategory] = useState({
    name: category.name,
    description: category.description,
  });

  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${config.baseURL}/v1/api/category/update/${category._id}`,
        updatedCategory,
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Category updated successfully!");
        fetchCategories(); // Refresh the list after updating
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Edit</Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update the details of this category.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdateCategory}>
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={updatedCategory.name}
                onChange={(e) =>
                  setUpdatedCategory({ ...updatedCategory, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            {/* Description Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={updatedCategory.description}
                onChange={(e) =>
                  setUpdatedCategory({ ...updatedCategory, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Update Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}