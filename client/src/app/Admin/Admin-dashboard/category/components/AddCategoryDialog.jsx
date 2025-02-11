"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import { useSelector } from "react-redux";

export default function AddCategoryDialog({ fetchCategories }) {
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${config.baseURL}/v1/api/category/create`,
        newCategory,
        {
          headers: { Authorization: `${token}` },
        }
      );
      if (response.status === 201) {
        toast.success("Category added successfully!");
        fetchCategories();
        setNewCategory({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add New Category</Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>Add a new category to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddCategory}>
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
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
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
