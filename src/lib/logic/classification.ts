import { MatterCategory, UrgencyLevel } from '../../types/legal';

export interface ClassificationResult {
  categories: MatterCategory[];
  primaryCategory: MatterCategory;
  urgency: UrgencyLevel;
  urgencyReasons: string[];
  emergencyContacts?: { label: string; number: string; description: string }[];
  isMultiDomain: boolean;
  domainNotes: string;
}

export function classifyIncident(
  narrative: string,
  incidentDateStr?: string,
  existingProceedings?: string
): ClassificationResult {
  const text = (narrative + ' ' + (existingProceedings || '')).toLowerCase();
  const categories: MatterCategory[] = [];

  // Criminal indicators
  if (
    /theft|stole|robbery|assault|cheating|fraud|scam|threat|extort|harass|beaten|police|fir|fir registered|complaint filed|crime|dowry|forgery/i.test(
      text
    )
  ) {
    categories.push('criminal');
  }

  // Cybercrime indicators
  if (
    /upi|cyber|whatsapp|hacked|phishing|online fraud|telegram scam|otp|sim swap|bank account hacked|unauthorized transaction|crypto/i.test(
      text
    )
  ) {
    categories.push('cybercrime');
  }

  // Consumer indicators
  if (
    /seller|defective|amazon|flipkart|refund|product|service deficiency|delivery|warranty|ecommerce|airline|hotel|flight cancelled|consumer/i.test(
      text
    )
  ) {
    categories.push('consumer');
  }

  // Tenancy indicators
  if (
    /landlord|tenant|rent|deposit|security deposit|evict|flat|lease agreement|broker|pg|rent agreement/i.test(
      text
    )
  ) {
    categories.push('tenancy');
  }

  // Contractual / commercial indicators
  if (
    /contract|invoice|payment pending|vendor|client unpaid|freelance|services rendered|breach|mou|agreement|default/i.test(
      text
    )
  ) {
    categories.push('contractual');
  }

  // Property indicators
  if (
    /property|land|ancestral|mutation|patta|khata|encroachment|boundary|title deed|builder|flat possession|rera/i.test(
      text
    )
  ) {
    categories.push('property');
  }

  // Family indicators
  if (
    /divorce|maintenance|custody|child|alimony|marriage|husband|wife|matrimonial|domestic violence/i.test(
      text
    )
  ) {
    categories.push('family');
  }

  // Employment indicators
  if (
    /salary|employer|employee|gratuity|pf|provident fund|termination|fired|resignation|bonus|workplace/i.test(
      text
    )
  ) {
    categories.push('employment');
  }

  // Civil fallback
  if (
    /damages|compensation|recovery of money|loan|promissory note|cheque bounce|negotiable instrument/i.test(
      text
    ) &&
    !categories.includes('contractual')
  ) {
    categories.push('civil');
  }

  if (categories.length === 0) {
    categories.push('civil'); // Default safe provisional classification
  }

  const primaryCategory = categories[0];
  const isMultiDomain = categories.length > 1;

  // Urgency check
  const urgencyReasons: string[] = [];
  const emergencyContacts: { label: string; number: string; description: string }[] = [];
  let urgency: UrgencyLevel = 'low';

  // Critical danger or arrest
  if (/immediate threat|kill|physical danger|stalking|suicide|violence right now|beating me|arrest/i.test(text)) {
    urgency = 'critical';
    urgencyReasons.push('Potential imminent physical risk, bodily harm, or arrest reported');
    emergencyContacts.push(
      { label: 'National Emergency Response System', number: '112', description: 'Immediate police & emergency dispatch' },
      { label: 'National Legal Aid Helpline', number: '15100', description: 'Free emergency legal support from NALSA' }
    );
  }

  // Domestic abuse
  if (/domestic violence|beaten by husband|in-laws throwing out|abuse at home/i.test(text)) {
    if (urgency !== 'critical') urgency = 'high';
    urgencyReasons.push('Domestic violence situation requiring immediate protective relief under PWDVA 2005');
    emergencyContacts.push(
      { label: 'Women Helpline (All India)', number: '181', description: '24/7 dedicated distress & shelter assistance' }
    );
  }

  // Cyber financial fraud (golden hour window)
  if (categories.includes('cybercrime') && /unauthorized debit|money deducted|scammed today|lost money/i.test(text)) {
    if (urgency !== 'critical') urgency = 'high';
    urgencyReasons.push('Cyber financial fraud reported: immediate reporting within 2-24 hours crucial to freeze fraudulent beneficiary accounts');
    emergencyContacts.push(
      { label: 'National Cyber Crime Reporting Helpline', number: '1930', description: 'Immediate freeze of fraudulent transaction funds via Citizen Financial Cyber Fraud Reporting System' }
    );
  }

  // Upcoming legal deadline or limitation
  if (/summons|hearing tomorrow|court date next week|notice period expiring|bailable warrant|limitation expiring/i.test(text)) {
    if (urgency === 'low') urgency = 'high';
    urgencyReasons.push('Active court process or time-sensitive notice period requiring immediate attention');
  }

  // Generate domain description
  let domainNotes = `This matter primarily falls under ${primaryCategory.toUpperCase()} law.`;
  if (isMultiDomain) {
    domainNotes += ` It also touches upon ${categories.slice(1).join(', ')} law, which will be evaluated in parallel.`;
  }

  return {
    categories,
    primaryCategory,
    urgency,
    urgencyReasons,
    emergencyContacts: emergencyContacts.length > 0 ? emergencyContacts : undefined,
    isMultiDomain,
    domainNotes,
  };
}
