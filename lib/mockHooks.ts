// Temporary mock hooks to replace Convex until it's properly set up
import { useState, useEffect } from 'react';
import { MockStore } from './mockStore';

const store = MockStore.getInstance();

// Mock useQuery hook with real reactivity
export function useQuery(queryName: string, args?: any) {
  const [data, setData] = useState(() => {
    console.log(`Mock Query: ${queryName}`, args);
    
    switch (queryName) {
      case 'api.leads.getLeads':
        return store.leads;
      case 'api.leads.getLeadStats':
        return store.getLeadStats();
      case 'api.proposals.getProposals':
        return store.proposals;
      case 'api.proposals.getProposalStats':
        return store.getProposalStats();
      case 'api.workOrders.getWorkOrders':
        return store.workOrders;
      case 'api.workOrders.getWorkOrderStats':
        return store.getWorkOrderStats();
      case 'api.invoices.getInvoices':
        return store.invoices;
      case 'api.invoices.getInvoiceStats':
        return store.getInvoiceStats();
      default:
        console.log(`Unhandled mock query: ${queryName}`);
        return undefined;
    }
  });
  
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      switch (queryName) {
        case 'api.leads.getLeads':
          setData([...store.leads]);
          break;
        case 'api.leads.getLeadStats':
          setData(store.getLeadStats());
          break;
        case 'api.proposals.getProposals':
          setData([...store.proposals]);
          break;
        case 'api.proposals.getProposalStats':
          setData(store.getProposalStats());
          break;
        case 'api.workOrders.getWorkOrders':
          setData([...store.workOrders]);
          break;
        case 'api.workOrders.getWorkOrderStats':
          setData(store.getWorkOrderStats());
          break;
        case 'api.invoices.getInvoices':
          setData([...store.invoices]);
          break;
        case 'api.invoices.getInvoiceStats':
          setData(store.getInvoiceStats());
          break;
      }
    });
    
    return unsubscribe;
  }, [queryName]);
  
  return data;
}

// Mock useMutation hook with real store operations
export function useMutation(mutationName: string) {
  console.log(`Mock Mutation: ${mutationName}`);
  
  return async (args: any) => {
    console.log(`Executing mock mutation ${mutationName} with args:`, args);
    
    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 100));
    
    switch (mutationName) {
      case 'api.leads.createLead':
        return store.createLead(args);
        
      case 'api.leads.updateLead':
        return store.updateLead(args.id, args);
        
      case 'api.invoices.createInvoice':
        return store.createInvoice({
          customerName: args.customerName,
          customerEmail: args.customerEmail,
          projectAddress: args.propertyAddress,
          total: args.totalAmount,
          dueDate: args.dueAt,
        });
        
      case 'api.invoices.updateInvoiceStatus':
        return store.updateInvoiceStatus(args.id, args.status);
        
      case 'api.invoices.deleteInvoice':
        return store.deleteInvoice(args.id);
        
      case 'api.workOrders.updateWorkOrder':
        return store.updateWorkOrder(args.id, args);
        
      case 'api.workOrders.scheduleWorkOrder':
        return store.scheduleWorkOrder(args.id, args);
        
      default:
        console.log(`Unhandled mock mutation: ${mutationName}`);
        return Promise.resolve({ success: true });
    }
  };
}