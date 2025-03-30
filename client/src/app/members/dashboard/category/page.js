"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AddCategoryDialog from "./components/AddCategoryDialog";
import EditCategoryDialog from "./components/EditCategoryDialog";
import config from "@/app/config_BASE_URL";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Access Redux state
  const auth = useSelector((state) => state.auth);
  const token = auth?.token || null;
  const permissions = auth?.user?.permissions || [];

  // Fetch all categories on component mount
  useEffect(() => {
    if (permissions.includes("view categories")) {
      fetchCategories();
    }
  }, [permissions]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.baseURL}/v1/api/category/all`, {
        headers: { Authorization: `${token}` },
      });
      setCategories(response.data.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const response = await axios.delete(`${config.baseURL}/v1/api/category/delete/${id}`, {
        headers: { Authorization: `${token}` },
      });
      if (response.status === 200) {
        toast.success("Category deleted successfully!");
        fetchCategories(); // Refresh the list after deleting
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category.");
    }
  };

  // If user doesn't have "view categories" permission, show access denied message
  if (!permissions.includes("view categories")) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Category Management</h2>
        <Card>
          <CardContent>
            <p className="text-red-500">You do not have permission to view categories.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Toaster for displaying notifications */}
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Category Management</h2>
        {permissions.includes("create categories") && (
          <AddCategoryDialog fetchCategories={fetchCategories} />
        )}
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading categories...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      {/* Edit Button */}
                      {permissions.includes("edit categories") && (
                        <EditCategoryDialog
                          category={category}
                          fetchCategories={fetchCategories}
                        />
                      )}
                      {/* Delete Button */}
                      {permissions.includes("delete categories") && (
                        <button
                          className="text-red-500 ml-2"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          Delete
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}