"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, Font } from '@react-pdf/renderer';
import { treeShopConfig } from '@/lib/treeShopConfig';

// Register fonts if needed (optional)
// Font.register({
//   family: 'Helvetica',
//   src: 'https://fonts.gstatic.com/s/helvetica/...'
// });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    marginBottom: 30,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  proposalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  proposalNumber: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#22C55E',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontSize: 10,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#333',
  },
  table: {
    width: 'auto',
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '2px solid #22C55E',
    paddingBottom: 8,
    marginBottom: 5,
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  tableCol: {
    fontSize: 10,
    paddingVertical: 5,
  },
  col1: { width: '40%' },
  col2: { width: '15%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  totalsSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '2px solid #E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    fontSize: 10,
    textAlign: 'right',
    marginRight: 20,
  },
  totalValue: {
    width: 100,
    fontSize: 10,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22C55E',
    borderTop: '2px solid #22C55E',
    paddingTop: 5,
  },
  terms: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  termItem: {
    fontSize: 9,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
  },
  signature: {
    marginTop: 40,
    paddingTop: 20,
  },
  signatureLine: {
    borderTop: '1px solid #333',
    width: 200,
    marginTop: 50,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#666',
  },
  validUntil: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FEF3C7',
    fontSize: 10,
    textAlign: 'center',
  },
});

interface ProposalPDFProps {
  proposal: {
    proposalNumber: string;
    createdAt: string | number;
    validUntil?: string | number;
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
      zipCode?: string;
    };
    property: {
      address: string;
      acreage: number;
    };
    services: {
      service: string;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      total: number;
    }[];
    pricing: {
      total: number;
      deposit: number;
    };
    notes?: string;
    terms?: string;
  };
}

const ProposalPDFDocument: React.FC<ProposalPDFProps> = ({ proposal }) => {
  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Tree Shop</Text>
          <Text style={styles.companyInfo}>{formatPhone(treeShopConfig.company.phone)}</Text>
          <Text style={styles.companyInfo}>{treeShopConfig.company.email}</Text>
          <Text style={styles.companyInfo}>{treeShopConfig.company.website}</Text>
        </View>

        {/* Proposal Title */}
        <Text style={styles.proposalTitle}>PROPOSAL</Text>
        <Text style={styles.proposalNumber}>
          #{proposal.proposalNumber} | {formatDate(proposal.createdAt)}
        </Text>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{proposal.customer.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{proposal.customer.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{formatPhone(proposal.customer.phone)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{proposal.customer.address}</Text>
          </View>
        </View>

        {/* Property Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{proposal.property.address}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Acreage:</Text>
            <Text style={styles.value}>{proposal.property.acreage} acres</Text>
          </View>
        </View>

        {/* Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of Work</Text>
          
          {/* Services Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableColHeader, styles.col1]}>Service</Text>
              <Text style={[styles.tableColHeader, styles.col2]}>Qty</Text>
              <Text style={[styles.tableColHeader, styles.col3]}>Unit</Text>
              <Text style={[styles.tableColHeader, styles.col4]}>Rate</Text>
              <Text style={[styles.tableColHeader, styles.col5]}>Total</Text>
            </View>
            
            {proposal.services.map((service, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.col1}>
                  <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>
                    {service.service}
                  </Text>
                  <Text style={[styles.tableCol, { fontSize: 9, color: '#666' }]}>
                    {service.description}
                  </Text>
                </View>
                <Text style={[styles.tableCol, styles.col2]}>{service.quantity}</Text>
                <Text style={[styles.tableCol, styles.col3]}>{service.unit}</Text>
                <Text style={[styles.tableCol, styles.col4]}>
                  ${service.unitPrice.toLocaleString()}
                </Text>
                <Text style={[styles.tableCol, styles.col5]}>
                  ${service.total.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={[styles.totalLabel, styles.grandTotal]}>Total:</Text>
              <Text style={[styles.totalValue, styles.grandTotal]}>
                ${proposal.pricing.total.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Deposit (25%):</Text>
              <Text style={[styles.totalValue, { color: '#EAB308' }]}>
                ${proposal.pricing.deposit.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {proposal.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{proposal.notes}</Text>
          </View>
        )}

        {/* Terms & Conditions */}
        <View style={styles.terms}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termItem}>
            • {treeShopConfig.terms.payment.terms[0]}
          </Text>
          <Text style={styles.termItem}>
            • {treeShopConfig.terms.payment.terms[1]}
          </Text>
          <Text style={styles.termItem}>
            • {treeShopConfig.terms.payment.terms[2]}
          </Text>
          <Text style={styles.termItem}>
            • {treeShopConfig.terms.environmental.text}
          </Text>
          <Text style={styles.termItem}>
            • {treeShopConfig.terms.permits.text}
          </Text>
          <Text style={styles.termItem}>
            • {treeShopConfig.financing.features[0]} available through {treeShopConfig.financing.provider}
          </Text>
        </View>

        {/* Valid Until */}
        {proposal.validUntil && (
          <View style={styles.validUntil}>
            <Text>This proposal is valid until {formatDate(proposal.validUntil)}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Customer Signature & Date</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for choosing Tree Shop! | {treeShopConfig.company.website}
        </Text>
      </Page>
    </Document>
  );
};

// Wrapper component for viewing PDF in browser
export const ProposalPDFViewer: React.FC<ProposalPDFProps> = ({ proposal }) => {
  return (
    <PDFViewer style={{ width: '100%', height: '600px' }}>
      <ProposalPDFDocument proposal={proposal} />
    </PDFViewer>
  );
};

export default ProposalPDFDocument;