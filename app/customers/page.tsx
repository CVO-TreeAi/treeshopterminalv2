"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// TODO: Replace with actual Convex hooks when backend is deployed
// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "@/lib/mockHooks";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import DataTable, { Column } from "@/components/shared/DataTable";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

interface Customer extends Record<string, unknown> {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  totalProjects: number;
  totalRevenue: number;
  lastProjectDate?: number;
  status: "active" | "inactive" | "prospect";
  leadSource?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: "active" | "inactive" | "prospect";
  leadSource: string;
  notes: string;
}

const initialFormData: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "FL",
  zipCode: "",
  status: "prospect",
  leadSource: "",
  notes: ""
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "prospect">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Load customers data
  useEffect(() => {
    loadCustomers();
  }, []);

  // Note: Customers are derived from leads - using leads as customers
  const leadsData = useQuery('api.leads.getLeads', { limit: 100 });
  const updateLeadMutation = useMutation('api.leads.updateLead');

  useEffect(() => {
    if (leadsData) {
      // Transform leads to customer format
      const customersFromLeads = leadsData.map(lead => ({
        _id: lead._id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        address: lead.propertyAddress,
        totalProjects: 1, // Will be calculated properly in production
        totalRevenue: lead.instantQuote || 0,
        lastProjectDate: lead.updatedAt || lead.createdAt,
        status: lead.status === "accepted" ? "active" : "prospect",
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt || lead.createdAt,
        notes: lead.additionalDetails || ""
      }));
      setCustomers(customersFromLeads);
      setLoading(false);
    }
  }, [leadsData]);

  const loadCustomers = () => {
    // Data automatically loads via useQuery hook
    setLoading(leadsData === undefined);
  };

  // Create new customer
  const createCustomer = async (data: CustomerFormData) => {
    try {
      setSubmitting(true);
      // TODO: Replace with actual Convex mutation
      // await convex.mutation(api.customers.create, {
      //   ...data,
      //   totalProjects: 0,
      //   totalRevenue: 0,
      //   createdAt: Date.now(),
      //   updatedAt: Date.now()
      // });
      
      // Note: Customers are created as leads first in the TreeShop workflow
      console.log("Customer creation should typically go through the lead process first:", data);
      await loadCustomers();
      setShowCreateForm(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Update customer
  const updateCustomer = async (id: string, data: Partial<CustomerFormData>) => {
    try {
      setSubmitting(true);
      // TODO: Replace with actual Convex mutation
      // await convex.mutation(api.customers.update, {
      //   id,
      //   ...data,
      //   updatedAt: Date.now()
      // });
      
      // Update the underlying lead record
      await updateLeadMutation({
        id: id as any,
        additionalDetails: data.notes
      });
      await loadCustomers();
      setEditingCustomer(null);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      // TODO: Replace with actual Convex mutation
      // await convex.mutation(api.customers.delete, { id });
      
      // Note: In production, customers should typically be deactivated rather than deleted
      console.log("Customer deletion not implemented - customer data preservation is important:", id);
      await loadCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      await updateCustomer(editingCustomer._id, formData);
    } else {
      await createCustomer(formData);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city || "",
      state: customer.state || "FL",
      zipCode: customer.zipCode || "",
      status: customer.status,
      leadSource: customer.leadSource || "",
      notes: customer.notes || ""
    });
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCustomer(null);
    setFormData(initialFormData);
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesFilter = filterStatus === "all" || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Table columns
  const columns: Column<Customer>[] = [
    {
      key: "name",
      label: "Customer",
      render: (customer) => (
        <div>
          <div className="font-medium text-white">{customer.name}</div>
          <div className="text-sm text-gray-400">{customer.email}</div>
        </div>
      )
    },
    {
      key: "phone",
      label: "Phone",
      render: (customer) => (
        <div className="text-sm text-gray-300">{customer.phone}</div>
      )
    },
    {
      key: "address",
      label: "Location", 
      render: (customer) => (
        <div className="text-sm text-gray-300">
          {customer.city && customer.state ? `${customer.city}, ${customer.state}` : customer.address}
        </div>
      )
    },
    {
      key: "totalProjects",
      label: "Projects",
      render: (customer) => (
        <div className="text-center">
          <div className="font-medium text-white">{customer.totalProjects}</div>
          <div className="text-xs text-gray-400">completed</div>
        </div>
      )
    },
    {
      key: "totalRevenue", 
      label: "Revenue",
      render: (customer) => (
        <div className="font-medium text-green-400">
          ${customer.totalRevenue.toLocaleString()}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (customer) => (
        <Badge 
          variant={
            customer.status === "active" ? "success" :
            customer.status === "inactive" ? "default" : "warning"
          }
        >
          {customer.status}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (customer) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(customer)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => deleteCustomer(customer._id)}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <AuthenticatedLayout>
      <DirectoryLayout
        title="Customer Database"
        subtitle="Manage your customer relationships and project history"
        actions={
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="primary"
            size="sm"
          >
            + Add Customer
          </Button>
        }
      >
        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{customers.length}</div>
              <div className="text-sm text-gray-400">Total Customers</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {customers.filter(c => c.status === "active").length}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {customers.filter(c => c.status === "prospect").length}
              </div>
              <div className="text-sm text-gray-400">Prospects</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                ${customers.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Revenue</div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>

        {/* Customer Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-400">Loading customers...</p>
          </div>
        ) : (
          <DataTable
            data={filteredCustomers}
            columns={columns}
            emptyMessage="No customers found. Start by converting leads to customers."
          />
        )}

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-6">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({...prev, status: e.target.value as any}))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                    >
                      <option value="prospect">Prospect</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State
                    </label>
                    <Input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({...prev, state: e.target.value}))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ZIP Code
                    </label>
                    <Input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({...prev, zipCode: e.target.value}))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lead Source
                  </label>
                  <Input
                    type="text"
                    value={formData.leadSource}
                    onChange={(e) => setFormData(prev => ({...prev, leadSource: e.target.value}))}
                    placeholder="e.g., Website, Referral, Google Ads"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 resize-none"
                    placeholder="Additional notes about this customer..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Saving..." : editingCustomer ? "Update Customer" : "Create Customer"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DirectoryLayout>
    </AuthenticatedLayout>
  );
}