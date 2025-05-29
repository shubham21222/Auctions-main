"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import config from "@/app/config_BASE_URL";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EditModal from './components/EditModal';

const SellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
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
  const limit = 10;

  // Get token from Redux store (assuming auth slice)
  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    const fetchSellers = async () => {
      if (!token) {
        toast.error("Authentication required! Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${config.baseURL}/v1/api/seller/all?page=${page}&limit=${limit}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === true) {
          setSellers(data.items.sellers || []);
          setTotalPages(data.items.totalPages || 1);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
        toast.error("Failed to fetch sellers!");
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, [token, page]);

  const handleApprove = async (sellerId) => {
    if (!token) {
      toast.error("Authentication required!");
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/v1/api/seller/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          ApprovalByAdmin: "true",
          id: sellerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success("Seller approved successfully!");
      setSellers((prevSellers) =>
        prevSellers.map((seller) =>
          seller._id === sellerId ? { ...seller, Approved: true } : seller
        )
      );
      setSelectedSeller(prev => prev?._id === sellerId ? { ...prev, Approved: true } : prev);
    } catch (error) {
      console.error("Error approving seller:", error);
      toast.error("Failed to approve seller!");
    }
  };

  const handleDelete = async (sellerId) => {
    if (!token) {
      toast.error("Authentication required!");
      return;
    }

    if (!confirm("Are you sure you want to delete this seller?")) return;

    try {
      const response = await fetch(
        `${config.baseURL}/v1/api/seller/delete/${sellerId}`,
        {
          method: "POST",
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Seller deleted successfully!");
      setSellers((prevSellers) => prevSellers.filter((seller) => seller._id !== sellerId));
      if (selectedSeller?._id === sellerId) {
        setSelectedSeller(null);
        setShowDetails(false);
      }
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error("Failed to delete seller!");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleEdit = (seller) => {
    setEditingSeller(seller);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedData) => {
    // Update the sellers list
    setSellers((prevSellers) =>
      prevSellers.map((seller) =>
        seller._id === editingSeller._id ? { ...seller, ...updatedData } : seller
      )
    );
    // Update selected seller if it's the one being edited
    if (selectedSeller?._id === editingSeller._id) {
      setSelectedSeller((prev) => ({ ...prev, ...updatedData }));
    }
  };

  const handleInputChange = (section, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const SellerCard = ({ seller }) => (
    <div
      onClick={() => {
        setSelectedSeller(seller);
        setShowDetails(true);
      }}
      className=" p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {seller.General?.object || "Unnamed Item"}
          </h2>
          <Badge variant={seller.Approved ? "success" : "warning"} className="mb-2">
            {seller.Approved ? "Approved" : "Pending"}
          </Badge>
        </div>
        {seller.Documents?.frontImage && (
          <img
            src={seller.Documents.frontImage}
            alt={seller.General?.object}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Category:</span> {seller.category?.name}
        </p>
        <p>
          <span className="font-medium">Seller:</span> {seller.createdBy?.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {seller.createdBy?.email}
        </p>
        <p>
          <span className="font-medium">Location:</span>{" "}
          {`${seller.logistic_info?.city}, ${seller.logistic_info?.country}`}
        </p>
        <p>
          <span className="font-medium">Created:</span>{" "}
          {format(new Date(seller.createdAt), "MMM d, yyyy")}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        {!seller.Approved && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(seller._id);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors text-sm"
          >
            Approve
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(seller);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(seller._id);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );

  const SellerDetails = ({ seller }) => (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
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
                  <p><span className="font-medium">Status:</span> <Badge variant={seller.Approved ? "success" : "warning"}>{seller.Approved ? "Approved" : "Pending"}</Badge></p>
                  <p><span className="font-medium">Category:</span> {seller.category?.name}</p>
                  <p><span className="font-medium">Created:</span> {format(new Date(seller.createdAt), "PPpp")}</p>
                  <p><span className="font-medium">Last Updated:</span> {format(new Date(seller.updatedAt), "PPpp")}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Seller Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {seller.createdBy?.name}</p>
                  <p><span className="font-medium">Email:</span> {seller.createdBy?.email}</p>
                  {seller.ApprovedBy && (
                    <p><span className="font-medium">Approved By:</span> {seller.ApprovedBy.name}</p>
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
                    value && <p key={key}><span className="font-medium">{key}:</span> {value}</p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Measurements & Condition</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(seller.Measurement || {}).map(([key, value]) => (
                    value && <p key={key}><span className="font-medium">{key}:</span> {value}</p>
                  ))}
                  {Object.entries(seller.Condition || {}).map(([key, value]) => (
                    value && <p key={key}><span className="font-medium">{key}:</span> {value}</p>
                  ))}
                </div>
              </div>
            </div>
            {seller.Provenance && Object.values(seller.Provenance).some(Boolean) && (
              <div>
                <h3 className="font-semibold mb-2">Provenance</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(seller.Provenance).map(([key, value]) => (
                    value && <p key={key}><span className="font-medium">{key}:</span> {value}</p>
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
                  <p><span className="font-medium">Name:</span> {seller.logistic_info?.firstName} {seller.logistic_info?.lastName}</p>
                  <p><span className="font-medium">Email:</span> {seller.logistic_info?.email}</p>
                  <p><span className="font-medium">Phone:</span> {seller.logistic_info?.phone || "N/A"}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Country:</span> {seller.logistic_info?.country}</p>
                  <p><span className="font-medium">State:</span> {seller.logistic_info?.state || "N/A"}</p>
                  <p><span className="font-medium">City:</span> {seller.logistic_info?.city}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Shipping Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Same Location:</span> {seller.logistic_info?.samelocation}</p>
                <p><span className="font-medium">Handling/Shipping:</span> {seller.logistic_info?.handlingshipping}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {seller.Documents?.frontImage && (
                <div>
                  <h3 className="font-semibold mb-2">Front Image</h3>
                  <img
                    src={seller.Documents.frontImage}
                    alt="Front"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              {seller.Documents?.backImage && (
                <div>
                  <h3 className="font-semibold mb-2">Back Image</h3>
                  <img
                    src={seller.Documents.backImage}
                    alt="Back"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            {seller.Documents?.detailImage && (
              <div>
                <h3 className="font-semibold mb-2">Detail Image</h3>
                <img
                  src={seller.Documents.detailImage}
                  alt="Detail"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-2">
          {!seller.Approved && (
            <button
              onClick={() => handleApprove(seller._id)}
              className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              Approve Seller
            </button>
          )}
          <button
            onClick={() => handleDelete(seller._id)}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Delete Seller
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="text-2xl text-gray-600 animate-pulse">Loading Sellers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Sellers Dashboard</h1>

        {/* Sellers Grid */}
        {sellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <SellerCard key={seller._id} seller={seller} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No sellers found.</div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-4 items-center">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>

        {/* Seller Details Modal */}
        {selectedSeller && <SellerDetails seller={selectedSeller} />}

        {/* Edit Modal */}
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          seller={editingSeller}
          onSuccess={handleEditSuccess}
          token={token}
        />
      </div>
    </div>
  );
};

export default SellersPage;