"use client";

import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import DataTable, { Column } from "@/components/shared/DataTable";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  workOrderId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  projectAddress: string;
  lineItems: {
    description: string;
    quantity: number;
    rate: number;
    total: number;
  }[];
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  sentDate?: number;
  dueDate?: number;
  paidDate?: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface InvoiceFormData {
  customerName: string;
  customerEmail: string;
  projectAddress: string;
  total: string;
  dueDate: string;
  notes: string;
}

const initialFormData: InvoiceFormData = {
  customerName: "",
  customerEmail: "",
  projectAddress: "",
  total: "",
  dueDate: "",
  notes: ""
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "sent" | "paid" | "overdue">("all");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual Convex query
      // const data = await convex.query(api.invoices.getAll);
      // setInvoices(data);
      
      // No fake data - real invoices only
      setInvoices([]);
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (data: InvoiceFormData) => {
    try {
      setSubmitting(true);
      const invoiceNumber = `INV-${Date.now()}`;
      
      // TODO: Replace with actual Convex mutation
      console.log("Would create invoice:", {
        invoiceNumber,
        ...data,
        total: parseFloat(data.total) || 0,
        dueDate: data.dueDate ? new Date(data.dueDate).getTime() : undefined,
        status: "draft",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      await loadInvoices();
      setShowCreateForm(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateInvoiceStatus = async (invoice: Invoice, newStatus: string) => {
    try {
      // TODO: Replace with actual Convex mutation
      console.log("Would update invoice status:", invoice._id, newStatus);
      await loadInvoices();
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    
    try {
      // TODO: Replace with actual Convex mutation
      console.log("Would delete invoice:", id);
      await loadInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoice(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "sent": return "info";
      case "paid": return "success";
      case "overdue": return "error";
      case "cancelled": return "secondary";
      default: return "secondary";
    }
  };

  const filteredInvoices = statusFilter === "all" 
    ? invoices 
    : invoices.filter(inv => inv.status === statusFilter);

  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      label: "Invoice",
      render: (invoice) => (
        <div>
          <div className="font-medium text-white">{invoice.invoiceNumber}</div>
          <div className="text-sm text-gray-400">{invoice.customerName}</div>
        </div>
      )
    },
    {
      key: "customerEmail",
      label: "Customer",
      render: (invoice) => (
        <div className="text-sm text-gray-300">{invoice.customerEmail}</div>
      )
    },
    {
      key: "total",
      label: "Amount",
      render: (invoice) => (
        <div className="font-medium text-green-400">
          ${invoice.total.toLocaleString()}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (invoice) => (
        <Badge variant={getStatusColor(invoice.status)}>
          {invoice.status}
        </Badge>
      )
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (invoice) => (
        <div className="text-sm text-gray-300">
          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "No due date"}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (invoice) => (
        <div className="flex gap-2">
          <select
            value={invoice.status}
            onChange={(e) => updateInvoiceStatus(invoice, e.target.value)}
            className="text-xs px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => deleteInvoice(invoice._id)}
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
        title="Invoices & Billing"
        subtitle="Invoice management and payment tracking"
        actions={
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="primary"
              size="sm"
            >
              + New Invoice
            </Button>
          </div>
        }
      >
        {/* Invoice Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{invoices.length}</div>
              <div className="text-sm text-gray-400">Total Invoices</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {invoices.filter(inv => inv.status === "paid").length}
              </div>
              <div className="text-sm text-gray-400">Paid</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {invoices.filter(inv => inv.status === "overdue").length}
              </div>
              <div className="text-sm text-gray-400">Overdue</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                ${invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Collected</div>
            </div>
          </Card>
        </div>

        {/* Invoices Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-400">Loading invoices...</p>
          </div>
        ) : (
          <DataTable
            data={filteredInvoices}
            columns={columns}
            emptyMessage="No invoices found. Create invoices from completed work orders."
          />
        )}

        {/* Create Invoice Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-6">Create New Invoice</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({...prev, customerName: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({...prev, customerEmail: e.target.value}))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Address *
                  </label>
                  <Input
                    type="text"
                    value={formData.projectAddress}
                    onChange={(e) => setFormData(prev => ({...prev, projectAddress: e.target.value}))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total Amount *
                    </label>
                    <Input
                      type="number"
                      value={formData.total}
                      onChange={(e) => setFormData(prev => ({...prev, total: e.target.value}))}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({...prev, dueDate: e.target.value}))}
                    />
                  </div>
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
                    placeholder="Payment terms, special instructions, etc..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Creating..." : "Create Invoice"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData(initialFormData);
                    }}
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