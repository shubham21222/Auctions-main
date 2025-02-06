"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BuyNow() {
  const [products, setProducts] = useState([
    { id: 1, name: "Smartphone", price: 599, category: "Electronics", stock: 50 },
    { id: 2, name: "Laptop", price: 999, category: "Electronics", stock: 30 },
    { id: 3, name: "Running Shoes", price: 89, category: "Sports", stock: 100 },
  ]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", stock: "" });

  const addProduct = (e) => {
    e.preventDefault();
    setProducts([
      ...products,
      {
        id: Date.now(),
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category,
        stock: Number(newProduct.stock),
      },
    ]);
    setNewProduct({ name: "", price: "", category: "", stock: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Buy Now Products</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Add a new product to the Buy Now section.</DialogDescription>
            </DialogHeader>
            <form onSubmit={addProduct}>
              <div className="grid gap-4 py-4">
                {/* Name Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                {/* Price Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                {/* Category Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Button variant="ghost">Edit</Button>
                    <Button variant="ghost" className="text-red-500">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}