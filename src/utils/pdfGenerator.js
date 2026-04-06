import { jsPDF } from "jspdf";
import { format } from "date-fns";

/**
 * Generates a professional PDF receipt with property details
 */
export const generateReceiptPDF = (payment, renter, property) => {
  const doc = new jsPDF();
  
  // Header Background
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(0, 0, 210, 40, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("OFFICIAL RECEIPT", 105, 25, null, null, "center");

  // Reset text color for body
  doc.setTextColor(30, 30, 30);

  // Property & Receipt Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PROPERTY INFORMATION", 20, 55);
  doc.setFont("helvetica", "normal");
  doc.text(property?.name || "N/A", 20, 62);
  doc.text(property?.address || renter?.address || "N/A", 20, 67);

  // Receipt Meta
  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT DETAILS", 130, 55);
  doc.setFont("helvetica", "normal");
  doc.text(`Receipt ID: ${payment.id.substring(0, 8).toUpperCase()}`, 130, 62);
  doc.text(`Date Recorded: ${format(new Date(payment.date), 'MMM dd, yyyy')}`, 130, 67);
  doc.text(`Date Received: ${format(new Date(payment.received_date || payment.date), 'MMM dd, yyyy')}`, 130, 72);

  // Amount Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(15, 85, 180, 25, 2, 2, 'FD');
  doc.setFontSize(16);
  doc.setTextColor(21, 128, 61);
  doc.text("TOTAL AMOUNT RECEIVED", 25, 101);
  doc.setFontSize(22);
  doc.text(`$${parseFloat(payment.amount).toFixed(2)}`, 185, 102, null, null, "right");

  // Tenant Info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RECEIVED FROM:", 20, 125);
  doc.setFont("helvetica", "normal");
  doc.text(renter?.name || "Tenant", 20, 132);
  if (renter?.co_tenants) {
    doc.setFontSize(9);
    doc.text(`Additional: ${renter.co_tenants}`, 20, 137);
  }

  // Payment Breakdown
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT DESCRIPTION:", 20, 155);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Category: ${payment.category || "Rent"}`, 20, 165);
  doc.text(`Memo: ${payment.note || "Standard monthly payment"}`, 20, 172);

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text("Thank you for your business.", 105, 270, null, null, "center");
  doc.text("PropTrack Cloud Management System", 105, 275, null, null, "center");

  doc.save(`Receipt-${payment.id.substring(0,6)}.pdf`);
};

/**
 * Generates a statement for multiple months
 */
export const generateStatementPDF = (payments, renter, property, startDate, endDate) => {
  const doc = new jsPDF();
  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ACCOUNT STATEMENT", 105, 25, null, null, "center");

  doc.setTextColor(30,30,30);
  doc.setFontSize(11);
  doc.text(`Statement Period: ${startDate} to ${endDate}`, 20, 50);
  
  doc.setFont("helvetica", "bold");
  doc.text("Tenant:", 20, 60);
  doc.text("Property:", 110, 60);
  
  doc.setFont("helvetica", "normal");
  doc.text(renter?.name || "N/A", 40, 60);
  doc.text(property?.name || "N/A", 130, 60);

  // Table
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 75, 180, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.text("DATE", 20, 82);
  doc.text("CATEGORY", 60, 82);
  doc.text("AMOUNT", 185, 82, null, null, "right");

  let y = 95;
  doc.setFont("helvetica", "normal");
  payments.forEach(p => {
    doc.text(format(new Date(p.date), 'MM/dd/yyyy'), 20, y);
    doc.text(p.category || 'Rent', 60, y);
    doc.text(`$${parseFloat(p.amount).toFixed(2)}`, 185, y, null, null, "right");
    y += 10;
  });

  doc.setDrawColor(200);
  doc.line(15, y, 195, y);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PAID:", 130, y + 10);
  doc.text(`$${total.toLocaleString()}`, 185, y + 10, null, null, "right");

  doc.save(`Statement-${renter?.name?.replace(/\s/g,'-')}.pdf`);
};