import { LegalAidResource } from '../../types/legal';

export const OFFICIAL_LEGAL_AID_DIRECTORY: LegalAidResource[] = [
  {
    id: 'nalsa_central',
    name: 'National Legal Services Authority (NALSA)',
    type: 'national',
    stateOrUT: 'All India',
    website: 'https://nalsa.gov.in',
    contactPhone: '011-23382778',
    helpline: '15100',
    email: 'nalsa-dla@nic.in',
    address: 'B-Block, Ground Floor, Additional Building Complex, Supreme Court of India, New Delhi - 110001',
    serviceDescription:
      'Apex statutory body established under Legal Services Authorities Act, 1987. Provides free legal aid, organizes Lok Adalats, and runs the nationwide 24x7 legal aid helpline 15100.',
    eligibilityCriteria: [
      'Women and Children',
      'Members of SC / ST communities',
      'Persons with disabilities (physical or mental)',
      'Victims of human trafficking or begar',
      'Industrial workmen',
      'Persons in custody / undertrial prisoners',
      'Victims of mass disasters, ethnic violence, flood, drought, earthquake',
      'Persons with annual income below specified statutory state limits (typically up to ₹3,00,000/-)',
    ],
    sourceUrl: 'https://nalsa.gov.in/acts-rules/eligibility-criteria',
    lastVerifiedDate: '2024-09-01',
  },
  {
    id: 'sclsc_delhi',
    name: 'Supreme Court Legal Services Committee (SCLSC)',
    type: 'specialized',
    stateOrUT: 'All India (Supreme Court matters)',
    website: 'https://sclsc.gov.in',
    contactPhone: '011-23388313',
    helpline: '15100',
    email: 'sclsc@nic.in',
    address: '107, Lawyers Chambers, Supreme Court of India Compound, New Delhi - 110001',
    serviceDescription:
      'Provides free legal services, advocate appointment, and filing of Special Leave Petitions (SLPs) and Appeals before the Supreme Court of India.',
    eligibilityCriteria: [
      'All criteria under Section 12 of LSA Act 1987',
      'Annual income limit for Supreme Court legal aid is up to ₹5,00,000/-',
    ],
    sourceUrl: 'https://sclsc.gov.in',
    lastVerifiedDate: '2024-09-01',
  },
  {
    id: 'tele_law_doj',
    name: 'Tele-Law (Department of Justice & CSC e-Governance)',
    type: 'national',
    stateOrUT: 'All India (Rural & Urban Panchayats)',
    website: 'https://www.tele-law.in',
    contactPhone: '1800-180-1510',
    helpline: '14417',
    address: 'Department of Justice, Jaisalmer House, 26, Man Singh Road, New Delhi - 110011',
    serviceDescription:
      'Connects citizens with panel lawyers via video conferencing and telephone at Common Service Centres (CSCs) across 1 Lakh+ Gram Panchayats. Free for eligible persons under Section 12.',
    eligibilityCriteria: [
      'Eligible Section 12 beneficiaries receive completely free pre-litigation legal advice',
      'Nominal fee of ₹30 for general citizens not falling under Section 12',
    ],
    sourceUrl: 'https://www.tele-law.in',
    lastVerifiedDate: '2024-09-01',
  },
  {
    id: 'dslsa_delhi',
    name: 'Delhi State Legal Services Authority (DSLSA)',
    type: 'state',
    stateOrUT: 'Delhi',
    district: 'Central Delhi',
    website: 'https://dslsa.org',
    contactPhone: '011-23384781',
    helpline: '1516',
    email: 'dslsa-phc@nic.in',
    address: 'Central Office, Pre-Fab Building, Patiala House Courts Complex, New Delhi - 110001',
    serviceDescription:
      'Provides free legal counsel, victim compensation, Lok Adalat resolution, and DLSA legal aid clinics across all 11 Delhi judicial districts.',
    eligibilityCriteria: [
      'Women and children (no income bar)',
      'SC / ST persons',
      'General category residents of Delhi with annual income up to ₹3,00,000/-',
    ],
    sourceUrl: 'https://dslsa.org/eligibility-criteria/',
    lastVerifiedDate: '2024-09-01',
  },
  {
    id: 'kslsa_karnataka',
    name: 'Karnataka State Legal Services Authority (KSLSA)',
    type: 'state',
    stateOrUT: 'Karnataka',
    district: 'Bengaluru Urban',
    website: 'https://kslsa.kar.nic.in',
    contactPhone: '080-22111711',
    helpline: '15100',
    email: 'kslsa-kar@nic.in',
    address: 'Nyaya Degula, 1st Floor, H. Siddaiah Road, Bengaluru - 560027',
    serviceDescription:
      'Administers legal aid across Karnataka, free panel advocates for trial courts and High Court of Karnataka, mediation centres, and Lok Adalats.',
    eligibilityCriteria: [
      'Women and children',
      'SC / ST communities',
      'Karnataka residents with annual income up to ₹3,00,000/-',
      'Under-trials and persons in judicial custody',
    ],
    sourceUrl: 'https://kslsa.kar.nic.in',
    lastVerifiedDate: '2024-09-01',
  },
  {
    id: 'mslsa_maharashtra',
    name: 'Maharashtra State Legal Services Authority (MSLSA)',
    type: 'state',
    stateOrUT: 'Maharashtra',
    district: 'Mumbai',
    website: 'https://legalservices.maharashtra.gov.in',
    contactPhone: '022-22691358',
    helpline: '15100',
    email: 'mslsa-bhc@nic.in',
    address: '105, High Court P.W.D. Building, Fort, Mumbai - 400032',
    serviceDescription:
      'Provides free legal representation in Bombay High Court and District & Sessions Courts across Maharashtra.',
    eligibilityCriteria: [
      'Women, children, SC/ST, disabled persons',
      'Annual income up to ₹3,00,000/- for general litigants in Maharashtra',
    ],
    sourceUrl: 'https://legalservices.maharashtra.gov.in',
    lastVerifiedDate: '2024-09-01',
  },
  {
    id: 'tnslsa_tamil_nadu',
    name: 'Tamil Nadu State Legal Services Authority (TNSLSA)',
    type: 'state',
    stateOrUT: 'Tamil Nadu',
    district: 'Chennai',
    website: 'https://tnslsa.tn.gov.in',
    contactPhone: '044-25342834',
    helpline: '15100',
    email: 'tnslsa@gmail.com',
    address: 'North Fort Road, High Court Campus, Chennai - 600104',
    serviceDescription:
      'Manages 32 District Legal Services Authorities across Tamil Nadu, providing free legal aid, jail clinics, and mediation.',
    eligibilityCriteria: [
      'Section 12 categories: women, children, SC/ST, disabled persons',
      'Litigants with annual income up to ₹3,00,000/-',
    ],
    sourceUrl: 'https://tnslsa.tn.gov.in',
    lastVerifiedDate: '2024-09-01',
  },
  {
    id: 'upslsa_uttar_pradesh',
    name: 'Uttar Pradesh State Legal Services Authority (UPSLSA)',
    type: 'state',
    stateOrUT: 'Uttar Pradesh',
    district: 'Lucknow',
    website: 'https://upslsa.up.nic.in',
    contactPhone: '0522-2286395',
    helpline: '15100',
    email: 'upslsa@nic.in',
    address: 'IIIrd Floor, Jawahar Bhawan, Annexe, Ashok Marg, Lucknow - 226001',
    serviceDescription:
      'Covers all 75 districts of Uttar Pradesh through DLSAs, organizing Lok Adalats and appointing legal aid counsel.',
    eligibilityCriteria: [
      'Section 12 beneficiaries including women, SC/ST, custody undertrials',
      'Income limit up to ₹3,00,000/- per annum',
    ],
    sourceUrl: 'https://upslsa.up.nic.in',
    lastVerifiedDate: '2024-09-01',
  },
  {
    id: 'wbslsa_west_bengal',
    name: 'West Bengal State Legal Services Authority (WBSLSA)',
    type: 'state',
    stateOrUT: 'West Bengal',
    district: 'Kolkata',
    website: 'https://wbslsa.wb.gov.in',
    contactPhone: '033-22483892',
    helpline: '15100',
    email: 'wb-slsa@nic.in',
    address: 'City Civil Court Building, 2&3, Kiran Sankar Roy Road, Kolkata - 700001',
    serviceDescription:
      'Offers legal assistance, court representation, and pre-litigation dispute counseling across West Bengal.',
    eligibilityCriteria: [
      'Section 12 categories (women, children, SC/ST, disabled)',
      'Litigants with annual income up to ₹3,00,000/-',
    ],
    sourceUrl: 'https://wbslsa.wb.gov.in',
    lastVerifiedDate: '2024-09-01',
  },
];

export function searchLegalAid(query: string, stateOrUT?: string): LegalAidResource[] {
  const q = query.trim().toLowerCase();
  return OFFICIAL_LEGAL_AID_DIRECTORY.filter((resource) => {
    const matchesState =
      !stateOrUT ||
      stateOrUT === 'All' ||
      resource.stateOrUT.toLowerCase().includes(stateOrUT.toLowerCase()) ||
      resource.stateOrUT === 'All India';

    if (!matchesState) return false;

    if (!q) return true;

    return (
      resource.name.toLowerCase().includes(q) ||
      resource.stateOrUT.toLowerCase().includes(q) ||
      (resource.district && resource.district.toLowerCase().includes(q)) ||
      resource.serviceDescription.toLowerCase().includes(q) ||
      resource.eligibilityCriteria.some((c) => c.toLowerCase().includes(q))
    );
  });
}
