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

export default function Auctions() {
  const [auctions, setAuctions] = useState([
    { id: 1, name: "Vintage Watch", topBid: 500, status: "active", endDate: "2023-07-30" },
    { id: 2, name: "Rare Painting", topBid: 1200, status: "ended", endDate: "2023-06-15" },
    { id: 3, name: "Antique Furniture", topBid: 800, status: "active", endDate: "2023-08-05" },
  ]);
  const [newAuction, setNewAuction] = useState({ name: "", startingBid: "", endDate: "" });

  const addAuction = (e) => {
    e.preventDefault();
    setAuctions([
      ...auctions,
      {
        id: Date.now(),
        name: newAuction.name,
        topBid: Number(newAuction.startingBid),
        status: "active",
        endDate: newAuction.endDate,
      },
    ]);
    setNewAuction({ name: "", startingBid: "", endDate: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Auctions</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Auction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Auction</DialogTitle>
              <DialogDescription>Create a new auction by filling out the details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={addAuction}>
              <div className="grid gap-4 py-4">
                {/* Name Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newAuction.name}
                    onChange={(e) => setNewAuction({ ...newAuction, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                {/* Starting Bid Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startingBid" className="text-right">
                    Starting Bid
                  </Label>
                  <Input
                    id="startingBid"
                    type="number"
                    value={newAuction.startingBid}
                    onChange={(e) => setNewAuction({ ...newAuction, startingBid: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                {/* End Date Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newAuction.endDate}
                    onChange={(e) => setNewAuction({ ...newAuction, endDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Auction</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Active Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auction Name</TableHead>
                <TableHead>Top Bid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auctions.map((auction) => (
                <TableRow key={auction.id}>
                  <TableCell>{auction.name}</TableCell>
                  <TableCell>${auction.topBid}</TableCell>
                  <TableCell>
                    <Badge variant={auction.status === "active" ? "default" : "secondary"}>
                      {auction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{auction.endDate}</TableCell>
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