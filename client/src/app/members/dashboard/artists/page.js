'use client'
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const ArtistPage = () => {
  const [artists, setArtists] = useState([]);
  const [newArtist, setNewArtist] = useState({
    artistName: '',
    summary: '',
    Biography: '',
    images: ['']
  });
  const [editArtist, setEditArtist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  const API_URL = 'https://bid.nyelizabeth.com/v1/api/artist';

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL, {
        headers: { Authorization: token }
      });
      const artistData = Array.isArray(response.data.items) ? response.data.items : [];
      setArtists(artistData);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setError('Failed to load artists');
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, newArtist, {
        headers: { Authorization: token }
      });
      toast.success("Artist created successfully");
      fetchArtists();
      setNewArtist({ artistName: '', summary: '', Biography: '', images: [''] });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating artist:', error);
      toast.error("Failed to create artist");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: token }
      });
      toast.success("Artist deleted successfully");
      fetchArtists();
    } catch (error) {
      console.error('Error deleting artist:', error);
      toast.error("Failed to delete artist");
    }
  };

  const handleUpdate = (artist) => {
    setEditArtist({ ...artist, images: artist.images || [''] });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${editArtist._id}`, editArtist, {
        headers: { Authorization: token }
      });
      toast.success("Artist updated successfully");
      fetchArtists();
      setIsEditModalOpen(false);
      setEditArtist(null);
    } catch (error) {
      console.error('Error updating artist:', error);
      toast.error("Failed to update artist");
    }
  };

  const addImageField = (isEdit = false) => {
    if (isEdit) {
      setEditArtist({
        ...editArtist,
        images: [...editArtist.images, '']
      });
    } else {
      setNewArtist({
        ...newArtist,
        images: [...newArtist.images, '']
      });
    }
  };

  const updateImage = (index, value, isEdit = false) => {
    if (isEdit) {
      const newImages = [...editArtist.images];
      newImages[index] = value;
      setEditArtist({ ...editArtist, images: newImages });
    } else {
      const newImages = [...newArtist.images];
      newImages[index] = value;
      setNewArtist({ ...newArtist, images: newImages });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Artists Management</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Artist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Artist</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new artist.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Artist Name</label>
                <Input
                  placeholder="Enter artist name"
                  value={newArtist.artistName}
                  onChange={(e) => setNewArtist({ ...newArtist, artistName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Input
                  placeholder="Enter artist summary"
                  value={newArtist.summary}
                  onChange={(e) => setNewArtist({ ...newArtist, summary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Biography</label>
                <Textarea
                  placeholder="Enter artist biography"
                  value={newArtist.Biography}
                  onChange={(e) => setNewArtist({ ...newArtist, Biography: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Images</label>
                {newArtist.images.map((img, index) => (
                  <Input
                    key={index}
                    placeholder={`Image URL ${index + 1}`}
                    value={img}
                    onChange={(e) => updateImage(index, e.target.value)}
                    className="mb-2"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addImageField()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image URL
                </Button>
              </div>
              <Button type="submit" className="w-full">
                Create Artist
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading artists...
                    </div>
                  </td>
                </tr>
              ) : artists.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No artists found
                  </td>
                </tr>
              ) : (
                artists.map((artist) => (
                  <tr key={artist._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {artist.artistName || 'Unnamed Artist'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {artist.summary || 'No summary'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {artist.createdBy?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(artist.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdate(artist)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(artist._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Artist</DialogTitle>
            <DialogDescription>
              Modify the details of the artist.
            </DialogDescription>
          </DialogHeader>
          {editArtist && (
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Artist Name</label>
                <Input
                  placeholder="Enter artist name"
                  value={editArtist.artistName}
                  onChange={(e) => setEditArtist({ ...editArtist, artistName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Input
                  placeholder="Enter artist summary"
                  value={editArtist.summary}
                  onChange={(e) => setEditArtist({ ...editArtist, summary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Biography</label>
                <Textarea
                  placeholder="Enter artist biography"
                  value={editArtist.Biography}
                  onChange={(e) => setEditArtist({ ...editArtist, Biography: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Images</label>
                {editArtist.images.map((img, index) => (
                  <Input
                    key={index}
                    placeholder={`Image URL ${index + 1}`}
                    value={img}
                    onChange={(e) => updateImage(index, e.target.value, true)}
                    className="mb-2"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addImageField(true)}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image URL
                </Button>
              </div>
              <Button type="submit" className="w-full">
                Update Artist
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtistPage;