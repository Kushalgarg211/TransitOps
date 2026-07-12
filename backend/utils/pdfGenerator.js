const PDFDocument = require('pdfkit');

const generateOperationalPDF = (res, kpis, analytics, completedTrips) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Stream the output straight to the response
  doc.pipe(res);

  // Header Title
  doc
    .fillColor('#1E293B')
    .fontSize(24)
    .text('TransitOps Transport Operations', { align: 'center' });
  
  doc
    .fontSize(12)
    .fillColor('#64748B')
    .text('Fleet Performance & Analytics Report', { align: 'center' })
    .moveDown(1.5);

  // Draw a horizontal divider line
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E2E8F0').lineWidth(1).stroke();
  doc.moveDown(1.5);

  // Section 1: Dashboard KPIs
  doc.fillColor('#0F172A').fontSize(16).text('1. Fleet Status KPIs', { underline: true }).moveDown(1);
  
  doc.fontSize(11).fillColor('#334155');
  doc.text(`• Active Vehicles (On Trip): ${kpis.vehicles.active}`);
  doc.text(`• Available Vehicles: ${kpis.vehicles.available}`);
  doc.text(`• Vehicles In Shop: ${kpis.vehicles.inShop}`);
  doc.text(`• Retired Vehicles: ${kpis.vehicles.retired}`);
  doc.text(`• Drivers On Duty: ${kpis.drivers.onTrip}`);
  doc.text(`• Active Trips: ${kpis.trips.onTrip}`);
  doc.text(`• Pending Trips: ${kpis.trips.pending}`);
  doc.text(`• Fleet Utilization Rate: ${kpis.fleetUtilization}%`);
  doc.moveDown(1.5);

  // Section 2: Financials & Analytics
  doc.fillColor('#0F172A').fontSize(16).text('2. Financial & Efficiency Analytics', { underline: true }).moveDown(1);
  
  const summary = analytics.fleetSummary;
  doc.fontSize(11).fillColor('#334155');
  doc.text(`• Total Completed Trip Revenue: $${summary.totalRevenue.toLocaleString()}`);
  doc.text(`• Total Fuel Expenditures: $${summary.totalFuelCost.toLocaleString()}`);
  doc.text(`• Total Maintenance Expenditures: $${summary.totalMaintenanceCost.toLocaleString()}`);
  doc.text(`• Total Other Expenses: $${summary.totalExpenseCost.toLocaleString()}`);
  doc.text(`• Total Fleet Acquisition Cost: $${summary.totalAcquisitionCost.toLocaleString()}`);
  doc.text(`• Average Fuel Efficiency: ${summary.fuelEfficiency} km/L`);
  doc.text(`• Fleet Return on Investment (ROI): ${summary.roiPercentage}%`);
  doc.moveDown(1.5);

  // Section 3: Trips
  doc.fillColor('#0F172A').fontSize(16).text('3. Completed Trips Summary', { underline: true }).moveDown(1);
  
  if (completedTrips && completedTrips.length > 0) {
    completedTrips.forEach((t, i) => {
      doc.fontSize(10).fillColor('#334155');
      doc.text(`${i + 1}. [Trip #${t.id}] ${t.source} ➔ ${t.destination} | Revenue: $${t.revenue.toLocaleString()} | Distance: ${t.actual_distance || t.planned_distance} km`);
    });
  } else {
    doc.fontSize(11).fillColor('#64748B').text('No completed trips recorded at this time.');
  }

  // Footer page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(9)
      .fillColor('#94A3B8')
      .text(`Page ${i + 1} of ${pages.count}`, 50, 750, { align: 'center' });
  }

  doc.end();
};

module.exports = {
  generateOperationalPDF,
};
