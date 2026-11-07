// Report detail fields differ by vehicle condition.
// target: 'listing' = saved on the ad itself, 'report' = saved inside the inspection report.
// kind: text | number | year | date
export const REPORT_FIELDS = {
  Used: [
    { key: 'mileage', label: 'Mileage (km)', kind: 'number', required: true, target: 'listing', placeholder: 'e.g. 62000' },
    { key: 'inspectedBy', label: 'Inspected by (company or inspector)', kind: 'text', required: true, target: 'report', placeholder: 'Name on the report' },
    { key: 'inspectionDate', label: 'Inspection date', kind: 'date', required: true, target: 'report', placeholder: 'YYYY-MM-DD' },
    { key: 'chassisNo', label: 'Chassis number', kind: 'text', required: true, target: 'report', placeholder: 'As printed on the report' },
    { key: 'regNo', label: 'Registration number', kind: 'text', required: false, target: 'report', placeholder: 'e.g. CAB-1234' },
  ],
  Reconditioned: [
    { key: 'mileage', label: 'Mileage (km)', kind: 'number', required: true, target: 'listing', placeholder: 'e.g. 62000' },
    { key: 'year', label: 'Manufacture year', kind: 'year', required: true, target: 'listing', placeholder: 'e.g. 2016' },
    { key: 'manufactureCountry', label: 'Manufacture country', kind: 'text', required: true, target: 'listing', placeholder: 'e.g. Japan' },
    { key: 'auctionGrade', label: 'Auction grade', kind: 'text', required: true, target: 'listing', placeholder: 'e.g. 4.5' },
    { key: 'auctionAuthority', label: 'Auction authority', kind: 'text', required: true, target: 'listing', placeholder: 'e.g. USS Tokyo' },
    { key: 'exteriorGrade', label: 'Exterior grade', kind: 'text', required: false, target: 'report', placeholder: 'e.g. B' },
    { key: 'interiorGrade', label: 'Interior grade', kind: 'text', required: false, target: 'report', placeholder: 'e.g. B' },
    { key: 'chassisNo', label: 'Chassis number', kind: 'text', required: true, target: 'report', placeholder: 'As printed on the auction sheet' },
    { key: 'inspectionDate', label: 'Inspection date', kind: 'date', required: true, target: 'report', placeholder: 'YYYY-MM-DD' },
  ],
};

// Labels for the report-only fields (used when showing an ad)
export const REPORT_DETAIL_LABELS = {};
Object.values(REPORT_FIELDS).flat().forEach((f) => {
  if (f.target === 'report') REPORT_DETAIL_LABELS[f.key] = f.label;
});
