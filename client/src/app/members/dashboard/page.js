'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-blue-600 mt-2">Welcome back! Here&apos;s your activity summary.</p>
        </div>
        <Button variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">0</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-800">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-indigo-900">0</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600">No recent activity</p>
          </CardContent>
        </Card>
      </div>

      {/* <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-4">
          <Button variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
            Add Product
          </Button>
          <Button variant="outline" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
            View Orders
          </Button>
          <Button variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
            Manage Inventory
          </Button>
        </CardContent>
      </Card> */}
    </div>
  );
}