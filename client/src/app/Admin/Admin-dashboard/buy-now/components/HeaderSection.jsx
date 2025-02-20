'use client'
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import AddProductDialog from "./AddProductDialog";

export default function HeaderSection({ fetchProducts, token }) {
    return (
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Buy Now Products</h2>
        <AddProductDialogTrigger fetchProducts={fetchProducts} token={token} />
      </div>
    );
  }

  function AddProductDialogTrigger({ fetchProducts, token }) {
    const [isOpen, setIsOpen] = useState(false); // State to manage dialog visibility
  
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90">Add New Product</Button>
        </DialogTrigger>
        <AddProductDialog
          fetchProducts={fetchProducts}
          token={token}
          onClose={() => setIsOpen(false)}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      </Dialog>
    );
  }
  
  