import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface ReceiptPDFProps {
  purchaseDetails: {
    items: { id: string; name: string; price: number; quantity: number }[];
    total: number;
    paymentMethod: string;
  };
}

const styles = StyleSheet.create({
  page: { padding: 20 },
  section: { margin: 10, padding: 10 },
});

const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ purchaseDetails }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text>Receipt</Text>
        <Text>Date: {new Date().toLocaleDateString()}</Text>
        <Text>Items Purchased:</Text>
        {purchaseDetails.items.map((item) => (
          <Text key={item.id}>{item.name} - ${item.price.toFixed(2)} x {item.quantity}</Text>
        ))}
        <Text>Total Amount: ${purchaseDetails.total.toFixed(2)}</Text>
        <Text>Payment Method: {purchaseDetails.paymentMethod}</Text>
      </View>
    </Page>
  </Document>
);

export const ReceiptDownloadLink: React.FC<{ purchaseDetails: any }> = ({ purchaseDetails }) => (
  <PDFDownloadLink document={<ReceiptPDF purchaseDetails={purchaseDetails} />} fileName="receipt.pdf">
    {({ loading }) => (loading ? 'Loading document...' : 'Download Receipt')}
  </PDFDownloadLink>
);
