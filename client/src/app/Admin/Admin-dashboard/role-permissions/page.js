"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);

  // Get token from Redux store
  const auth = useSelector((state) => state.auth);
  const token = auth?.token;

  // Fetch roles and permissions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all roles
        const rolesResponse = await axios.get(
          "https://bid.nyelizabeth.com/v1/api/role/all",
          { headers: { Authorization: `${token}` } }
        );
        if (rolesResponse.data.status) {
          setRoles(rolesResponse.data.items || []);
        } else {
          toast.error("Failed to fetch roles");
        }

        // Fetch all permissions
        const permsResponse = await axios.get(
          "https://bid.nyelizabeth.com/v1/api/role/all-permissions",
          { headers: { Authorization: `${token}` } }
        );
        if (permsResponse.data.status) {
          const permissionsObject = permsResponse.data.items || {};
          const flattenedPermissions = Object.values(permissionsObject).flat();
          setAvailablePermissions(flattenedPermissions);
        } else {
          toast.error("Failed to fetch permissions");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    if (token) fetchData();
  }, [token]);

  // Handle permission selection
  const handlePermissionToggle = (permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName) {
      toast.error("Please enter a role name");
      return;
    }
    if (permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setLoading(true);
    try {
      const url = editRoleId
        ? `https://bid.nyelizabeth.com/v1/api/role/update/${editRoleId}`
        : "https://bid.nyelizabeth.com/v1/api/role/create";
      const method = editRoleId ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: { name: roleName, permissions },
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status) {
        toast.success(response.data.message || "Role saved successfully");
        // Refresh roles list instead of updating state directly
        const rolesResponse = await axios.get(
          "https://bid.nyelizabeth.com/v1/api/role/all",
          { headers: { Authorization: `${token}` } }
        );
        if (rolesResponse.data.status) {
          setRoles(rolesResponse.data.items || []);
        }
        resetForm();
      } else {
        toast.error(response.data.error || "Failed to save role");
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit role
  const handleEdit = (role) => {
    setEditRoleId(role._id);
    setRoleName(role.name);
    setPermissions(role.permissions || []);
  };

  // Handle delete role
  const handleDelete = async (roleId) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `https://bid.nyelizabeth.com/v1/api/role/delete/${roleId}`,
        { headers: { Authorization: `${token}` } }
      );

      if (response.data.status) {
        toast.success(response.data.message || "Role deleted successfully");
        // Refresh roles list instead of updating state directly
        const rolesResponse = await axios.get(
          "https://bid.nyelizabeth.com/v1/api/role/all",
          { headers: { Authorization: `${token}` } }
        );
        if (rolesResponse.data.status) {
          setRoles(rolesResponse.data.items || []);
        }
      } else {
        toast.error(response.data.error || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setRoleName("");
    setPermissions([]);
    setEditRoleId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions for your application</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">Important Note:</p>
            <p className="text-yellow-700">For managing live auctions, use exactly &quot;clerk&quot; as the role name (case-sensitive). Do not use variations like &quot;clerk1&quot; or &quot;Clerk&quot;.</p>
          </div>
        </div>

        {/* Roles Table Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Existing Roles</h2>
          {roles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role) => (
                    <tr key={role._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((permission, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(role)}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(role._id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No roles found.</p>
              <p className="text-gray-400 text-sm mt-2">Create a new role to get started</p>
            </div>
          )}
        </div>

        {/* Create/Edit Role Form Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {editRoleId ? "Edit Role" : "Create New Role"}
          </h2>
          {!token ? (
            <p className="text-red-500">Please log in to manage roles.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Name */}
              <div>
                <label
                  htmlFor="roleName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Role Name
                </label>
                <input
                  type="text"
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., clerk"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions
                </label>
                {availablePermissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-3 p-3 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          id={permission}
                          checked={permissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={loading}
                        />
                        <label
                          htmlFor={permission}
                          className="text-sm text-gray-700 truncate flex-1"
                        >
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Loading permissions...</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className={`flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Saving..." : editRoleId ? "Update Role" : "Create Role"}
                </button>
                {editRoleId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                    disabled={loading}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagementPage;