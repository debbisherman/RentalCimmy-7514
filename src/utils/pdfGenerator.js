import { jsPDF } from "jspdf";
import { format } from "date-fns";

/**
 * Generates a professional PDF receipt for a single payment
 */
export const generateReceiptPDF = (payment, renter) => {
  const doc = new jsPDF();
  const primaryColor = '#1e3a8a'; // blue-900
  const secondaryColor = '#475569'; // slate-600

  // Header Background
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 40, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("RENT RECEIPT", 105, 25, null, null, "center");

  // Reset text color for body
  doc.setTextColor(30, 30, 30);

  // Receipt Details Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(15, 50, 180, 40, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", 20, 60);
  doc.text("Date:", 20, 70);
  doc.text("Payment Method:", 20, 80);

  doc.setFont("helvetica", "normal");
  doc.text(`${payment.id.substring(0, 8).toUpperCase()}`, 60, 60);
  doc.text(`${format(new Date(payment.date), 'MMMM dd, yyyy')}`, 60, 70);
  doc.text(`Electronic Transfer`, 60, 80);

  // Amount Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(130, 55, 60, 30, 3, 3, 'FD');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text("Amount Received", 160, 65, null, null, "center");
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(21, 128, 61);
  doc.text(`$${parseFloat(payment.amount).toFixed(2)}`, 160, 78, null, null, "center");

  // Renter Info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.text("Received From:", 20, 110);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(renter?.name || "Tenant", 20, 120);
  doc.text(renter?.address || "Address Not Provided", 20, 127);

  // Payment Details
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details:", 20, 165);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Category:`, 20, 175);
  doc.text(payment.category || "Rent", 50, 175);
  doc.text(`Note:`, 20, 182);
  doc.text(payment.note || "Regular Payment", 50, 182);

  // Footer
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.text("This is an electronically generated receipt.", 105, 270, null, null, "center");
  doc.text("PropTrack Property Management", 105, 275, null, null, "center");

  doc.save(`Receipt-${payment.date}-${renter?.name?.replace(/\s+/g, '-')}.pdf`);
};

/**
 * Generates a full payment history statement for a renter
 */
export const generateStatementPDF = (payments, renter) => {
  const doc = new jsPDF();
  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  // Header
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT STATEMENT", 105, 25, null, null, "center");

  // Renter Info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.text("Tenant Name:", 20, 55);
  doc.text("Property:", 20, 62);
  doc.text("Statement Date:", 20, 69);

  doc.setFont("helvetica", "normal");
  doc.text(renter?.name || "N/A", 60, 55);
  doc.text(renter?.address || "N/A", 60, 62);
  doc.text(format(new Date(), 'MMMM dd, yyyy'), 60, 69);

  // Summary Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 80, 180, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DATE", 20, 86);
  doc.text("CATEGORY", 60, 86);
  doc.text("NOTE", 100, 86);
  doc.text("AMOUNT", 185, 86, null, null, "right");

  // Table Rows
  let y = 97;
  doc.setFont("helvetica", "normal");
  
  payments.forEach((p, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(252, 253, 254);
      doc.rect(15, y - 5, 180, 8, 'F');
    }

    doc.text(format(new Date(p.date), 'MM/dd/yyyy'), 20, y);
    doc.text(p.category || 'Rent', 60, y);
    doc.text((p.note || '').substring(0, 35), 100, y);
    doc.text(`$${parseFloat(p.amount).toFixed(2)}`, 185, y, null, null, "right");
    y += 10;
  });

  // Footer Total
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL PAID TO DATE:", 120, y + 10);
  doc.text(`$${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 185, y + 10, null, null, "right");

  doc.save(`Statement-${renter?.name?.replace(/\s+/g, '-')}.pdf`);
};