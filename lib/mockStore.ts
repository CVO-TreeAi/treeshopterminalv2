// Mock data store to maintain state across components
import { mockLeads, mockProposals, mockWorkOrders, mockInvoices } from './mockData';

// Create mutable copies of mock data
export class MockStore {
  private static instance: MockStore;
  
  public leads = [...mockLeads];
  public proposals = [...mockProposals];
  public workOrders = [...mockWorkOrders];
  public invoices = [...mockInvoices];
  
  private subscribers: (() => void)[] = [];
  
  static getInstance(): MockStore {
    if (!MockStore.instance) {
      MockStore.instance = new MockStore();
    }
    return MockStore.instance;
  }
  
  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
  
  private notify() {
    this.subscribers.forEach(callback => callback());
  }
  
  // Lead operations
  createLead(leadData: any) {
    const newLead = {
      _id: `lead_${Date.now()}`,
      ...leadData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'new'
    };
    this.leads.unshift(newLead);
    this.notify();
    return newLead._id;
  }
  
  updateLead(id: string, updates: any) {
    const index = this.leads.findIndex(lead => lead._id === id);
    if (index > -1) {
      this.leads[index] = {
        ...this.leads[index],
        ...updates,
        updatedAt: Date.now()
      };
      this.notify();
    }
    return id;
  }
  
  deleteLead(id: string) {
    const index = this.leads.findIndex(lead => lead._id === id);
    if (index > -1) {
      this.leads.splice(index, 1);
      this.notify();
    }
    return id;
  }
  
  // Invoice operations
  createInvoice(invoiceData: any) {
    const newInvoice = {
      _id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      ...invoiceData,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lineItems: []
    };
    this.invoices.unshift(newInvoice);
    this.notify();
    return newInvoice._id;
  }
  
  updateInvoiceStatus(id: string, status: string) {
    const index = this.invoices.findIndex(inv => inv._id === id);
    if (index > -1) {
      const updatedInvoice = {
        ...this.invoices[index],
        status: status as any,
        updatedAt: Date.now()
      };
      
      if (status === 'sent') {
        (updatedInvoice as any).sentDate = Date.now();
      }
      if (status === 'paid') {
        (updatedInvoice as any).paidDate = Date.now();
      }
      
      this.invoices[index] = updatedInvoice;
      this.notify();
    }
    return id;
  }
  
  deleteInvoice(id: string) {
    const index = this.invoices.findIndex(inv => inv._id === id);
    if (index > -1) {
      this.invoices.splice(index, 1);
      this.notify();
    }
    return id;
  }
  
  // Work order operations
  updateWorkOrder(id: string, updates: any) {
    const index = this.workOrders.findIndex(wo => wo._id === id);
    if (index > -1) {
      this.workOrders[index] = {
        ...this.workOrders[index],
        ...updates,
        updatedAt: Date.now()
      };
      this.notify();
    }
    return id;
  }
  
  scheduleWorkOrder(id: string, scheduleData: any) {
    const index = this.workOrders.findIndex(wo => wo._id === id);
    if (index > -1) {
      this.workOrders[index] = {
        ...this.workOrders[index],
        ...scheduleData,
        status: 'scheduled',
        updatedAt: Date.now()
      };
      this.notify();
    }
    return id;
  }
  
  // Get stats
  getLeadStats() {
    const leads = this.leads;
    return {
      total: leads.length,
      byStatus: {
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        validated: leads.filter(l => l.status === 'validated').length,
        quoted: leads.filter(l => l.status === 'quoted').length,
        accepted: leads.filter(l => l.status === 'accepted').length,
        rejected: leads.filter(l => l.status === 'rejected').length,
        lost: leads.filter(l => l.status === 'lost').length
      },
      bySource: {
        'treeshop.app': leads.filter(l => l.source === 'treeshop.app').length,
        'fltreeshop.com': leads.filter(l => l.source === 'fltreeshop.com').length,
        youtube: leads.filter(l => l.source === 'youtube').length,
        social: leads.filter(l => l.source === 'social').length,
        referral: leads.filter(l => l.source === 'referral').length
      },
      totalValue: leads.reduce((sum, lead) => sum + lead.instantQuote, 0),
      averageValue: leads.length > 0 ? leads.reduce((sum, lead) => sum + lead.instantQuote, 0) / leads.length : 0,
      conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'accepted').length / leads.length * 100) : 0
    };
  }
  
  getProposalStats() {
    const proposals = this.proposals;
    return {
      total: proposals.length,
      accepted: proposals.filter((p: any) => p.status === 'approved').length,
      sent: proposals.filter((p: any) => p.status === 'sent').length,
      draft: proposals.filter((p: any) => p.status === 'draft').length,
      totalValue: proposals.reduce((sum, p) => sum + p.total, 0),
      acceptedValue: proposals.filter((p: any) => p.status === 'approved').reduce((sum, p) => sum + p.total, 0),
      conversionRate: proposals.length > 0 ? (proposals.filter((p: any) => p.status === 'approved').length / proposals.length * 100) : 0
    };
  }
  
  getWorkOrderStats() {
    const workOrders = this.workOrders;
    return {
      total: workOrders.length,
      completed: workOrders.filter((wo: any) => wo.status === 'completed').length,
      inProgress: workOrders.filter((wo: any) => wo.status === 'in-progress').length,
      scheduled: workOrders.filter((wo: any) => wo.status === 'scheduled').length,
      totalRevenue: workOrders.filter((wo: any) => wo.status === 'completed').reduce((sum, wo: any) => sum + (wo.totalAmount || 0), 0),
      averageValue: workOrders.length > 0 ? workOrders.reduce((sum, wo: any) => sum + (wo.totalAmount || 0), 0) / workOrders.length : 0,
      completionRate: workOrders.length > 0 ? (workOrders.filter((wo: any) => wo.status === 'completed').length / workOrders.length * 100) : 0
    };
  }
  
  getInvoiceStats() {
    const invoices = this.invoices;
    return {
      total: invoices.length,
      paid: invoices.filter((inv: any) => inv.status === 'paid').length,
      sent: invoices.filter((inv: any) => inv.status === 'sent').length,
      overdue: invoices.filter((inv: any) => inv.status === 'overdue').length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      paidAmount: invoices.filter((inv: any) => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
      outstandingAmount: invoices.filter((inv: any) => ['sent', 'overdue'].includes(inv.status)).reduce((sum, inv) => sum + inv.total, 0),
      totalLateFees: 0, // Mock value
      collectionRate: invoices.length > 0 ? (invoices.filter((inv: any) => inv.status === 'paid').length / invoices.length * 100) : 0
    };
  }
}