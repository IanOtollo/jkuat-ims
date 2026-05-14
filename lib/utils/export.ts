import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const exportIncidentsToPDF = (incidents: any[], title: string = 'Incident Report') => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('JKUAT Emergency Incident Management System', 14, 22);
  
  doc.setFontSize(14);
  doc.text(title, 14, 32);
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 14, 38);

  const tableData = incidents.map(inc => [
    inc.reference_number,
    inc.incident_type,
    inc.location,
    inc.severity,
    inc.status,
    format(new Date(inc.created_at), 'dd/MM/yyyy')
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Ref', 'Type', 'Location', 'Severity', 'Status', 'Date']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [17, 17, 17] },
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyyMMdd')}.pdf`);
};
