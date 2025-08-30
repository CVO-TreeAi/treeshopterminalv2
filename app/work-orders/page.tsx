"use client";

import { useState, useEffect } from "react";
// TODO: Replace with actual Convex hooks when backend is deployed
// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "@/lib/mockHooks";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import DataTable, { Column } from "@/components/shared/DataTable";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

interface WorkOrder extends Record<string, unknown> {
  _id: string;
  workOrderNumber: string;
  proposalId?: string;
  customerId: string;
  customerName: string;
  projectAddress: string;
  services: string[];
  totalAmount: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "on-hold";
  scheduledDate?: number;
  startDate?: number;
  completedDate?: number;
  crewAssigned: string[];
  equipmentRequired: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface WorkOrderFormData {
  customerName: string;
  projectAddress: string;
  services: string;
  totalAmount: string;
  scheduledDate: string;
  crewAssigned: string;
  equipmentRequired: string;
  notes: string;
}

const initialFormData: WorkOrderFormData = {
  customerName: "",
  projectAddress: "",
  services: "",
  totalAmount: "",
  scheduledDate: "",
  crewAssigned: "",
  equipmentRequired: "",
  notes: ""
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [formData, setFormData] = useState<WorkOrderFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "in-progress" | "completed" | "cancelled">("all");

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const workOrdersData = useQuery('api.workOrders.getWorkOrders', { limit: 100 });
  const updateWorkOrderMutation = useMutation('api.workOrders.updateWorkOrder');
  const scheduleWorkOrderMutation = useMutation('api.workOrders.scheduleWorkOrder');

  useEffect(() => {
    if (workOrdersData) {
      setWorkOrders(workOrdersData);
      setLoading(false);
    }
  }, [workOrdersData]);

  const loadWorkOrders = () => {
    // Data automatically loads via useQuery hook
    setLoading(workOrdersData === undefined);
  };

  const createWorkOrder = async (data: WorkOrderFormData) => {
    try {
      setSubmitting(true);
      const workOrderNumber = `WO-${Date.now()}`;
      
      // Note: Creating work orders manually - typically they're created from accepted proposals
      console.log("Manual work order creation not fully implemented yet - work orders are typically created from accepted proposals");
      console.log("Work order data:", {
        workOrderNumber,
        ...data,
        services: data.services.split(",").map(s => s.trim()),
        totalAmount: parseFloat(data.totalAmount) || 0,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).getTime() : undefined,
        crewAssigned: data.crewAssigned.split(",").map(s => s.trim()),
        equipmentRequired: data.equipmentRequired.split(",").map(s => s.trim())
      });
      
      await loadWorkOrders();
      setShowCreateForm(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error creating work order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>) => {
    try {
      await updateWorkOrderMutation({
        id,
        scheduledDate: updates.scheduledDate,
        assignedCrew: updates.crewAssigned?.[0],
        equipment: updates.equipmentRequired,
        specialInstructions: updates.notes,
      });
    } catch (error) {
      console.error("Error updating work order:", error);
    }
  };

  const deleteWorkOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work order?")) return;
    
    try {
      // Note: In production, work orders should typically be cancelled rather than deleted
      console.log("Work order deletion not implemented - consider changing status to cancelled instead:", id);
    } catch (error) {
      console.error("Error deleting work order:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createWorkOrder(formData);
  };

  const handleStatusChange = async (workOrder: WorkOrder, newStatus: string) => {
    await updateWorkOrder(workOrder._id, { 
      status: newStatus as any,
      updatedAt: Date.now()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "warning";
      case "in-progress": return "info";
      case "completed": return "success";
      case "cancelled": return "error";
      case "on-hold": return "default";
      default: return "default";
    }
  };

  const filteredWorkOrders = statusFilter === "all" 
    ? workOrders 
    : workOrders.filter(wo => wo.status === statusFilter);

  const columns: Column<WorkOrder>[] = [
    {
      key: "workOrderNumber",
      label: "Work Order",
      render: (wo) => (
        <div>
          <div className="font-medium text-white">{wo.workOrderNumber}</div>
          <div className="text-sm text-gray-400">{wo.customerName}</div>
        </div>
      )
    },
    {
      key: "projectAddress",
      label: "Project Address",
      render: (wo) => (
        <div className="text-sm text-gray-300">{wo.projectAddress}</div>
      )
    },
    {
      key: "services",
      label: "Services",
      render: (wo) => (
        <div className="text-sm text-gray-300">
          {wo.services.slice(0, 2).join(", ")}
          {wo.services.length > 2 && ` +${wo.services.length - 2} more`}
        </div>
      )
    },
    {
      key: "totalAmount",
      label: "Amount",
      render: (wo) => (
        <div className="font-medium text-green-400">
          ${wo.totalAmount.toLocaleString()}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (wo) => (
        <Badge variant={getStatusColor(wo.status)}>
          {wo.status.replace("-", " ")}
        </Badge>
      )
    },
    {
      key: "scheduledDate",
      label: "Scheduled",
      render: (wo) => (
        <div className="text-sm text-gray-300">
          {wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : "Not scheduled"}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (wo) => (
        <div className="flex gap-2">
          <select
            value={wo.status}
            onChange={(e) => handleStatusChange(wo, e.target.value)}
            className="text-xs px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white"
          >
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => deleteWorkOrder(wo._id)}
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
        title="Work Orders"
        subtitle="Job scheduling, crew assignment, and project tracking"
        actions={
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="primary"
              size="sm"
            >
              + New Work Order
            </Button>
          </div>
        }
      >
        {/* Work Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{workOrders.length}</div>
              <div className="text-sm text-gray-400">Total Work Orders</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {workOrders.filter(wo => wo.status === "scheduled").length}
              </div>
              <div className="text-sm text-gray-400">Scheduled</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {workOrders.filter(wo => wo.status === "in-progress").length}
              </div>
              <div className="text-sm text-gray-400">In Progress</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {workOrders.filter(wo => wo.status === "completed").length}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </Card>
        </div>

        {/* Work Orders Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-400">Loading work orders...</p>
          </div>
        ) : (
          <DataTable
            data={filteredWorkOrders}
            columns={columns}
            emptyMessage="No work orders found. Create work orders from accepted proposals."
          />
        )}

        {/* Create Work Order Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-6">Create New Work Order</h3>

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
                      Total Amount *
                    </label>
                    <Input
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData(prev => ({...prev, totalAmount: e.target.value}))}
                      placeholder="0.00"
                      step="0.01"
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Services (comma-separated)
                  </label>
                  <Input
                    type="text"
                    value={formData.services}
                    onChange={(e) => setFormData(prev => ({...prev, services: e.target.value}))}
                    placeholder="Forestry Mulching, Land Clearing, Tree Removal"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scheduled Date
                    </label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({...prev, scheduledDate: e.target.value}))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Crew Assigned (comma-separated)
                    </label>
                    <Input
                      type="text"
                      value={formData.crewAssigned}
                      onChange={(e) => setFormData(prev => ({...prev, crewAssigned: e.target.value}))}
                      placeholder="John, Mike, Alex"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Equipment Required (comma-separated)
                  </label>
                  <Input
                    type="text"
                    value={formData.equipmentRequired}
                    onChange={(e) => setFormData(prev => ({...prev, equipmentRequired: e.target.value}))}
                    placeholder="CAT 299D3, Fecon Blackhawk, Grapple Truck"
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
                    placeholder="Special instructions, site conditions, etc..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Creating..." : "Create Work Order"}
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