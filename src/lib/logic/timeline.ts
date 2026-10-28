import { TimelineEvent, DocumentRecord, ClarificationQuestion } from '../../types/legal';

export function buildCaseTimeline(
  userNarrative: string,
  incidentDateStr?: string,
  answers: ClarificationQuestion[] = [],
  documents: DocumentRecord[] = []
): { events: TimelineEvent[]; anomalies: string[] } {
  const events: TimelineEvent[] = [];
  const anomalies: string[] = [];
  let eventCounter = 1;

  // 1. Primary Incident Date Event
  const qDate = answers.find((q) => q.id === 'q_incident_date');
  const primaryDate = qDate?.answer || incidentDateStr;

  if (primaryDate) {
    events.push({
      id: `evt_${eventCounter++}`,
      eventDescription: 'Primary incident / transaction occurred as reported by user',
      date: primaryDate,
      precision: 'exact',
      sourceType: qDate?.answer ? 'answer' : 'user_intake',
      partiesInvolved: ['Complainant', 'Opposite Party'],
    });
  }

  // 2. Extract dates from documents
  for (const doc of documents) {
    if (doc.documentDate) {
      events.push({
        id: `evt_${eventCounter++}`,
        eventDescription: `Document dated / executed: ${doc.filename}`,
        date: doc.documentDate,
        precision: 'exact',
        sourceType: 'document',
        sourceDocId: doc.id,
        partiesInvolved: doc.partiesMentioned.length > 0 ? doc.partiesMentioned : ['Parties to Document'],
      });
    }
  }

  // 3. Last communication event
  const qLastComm = answers.find((q) => q.id === 'q_last_communication_date');
  if (qLastComm?.answer && qLastComm.answer !== 'Not applicable' && qLastComm.answer !== 'I do not know') {
    events.push({
      id: `evt_${eventCounter++}`,
      eventDescription: 'Last communication / notice / demand issued to opposite party',
      date: qLastComm.answer,
      precision: 'exact',
      sourceType: 'answer',
      partiesInvolved: ['Complainant', 'Opposite Party'],
    });
  }

  // Fallback if no specific date was given: create approximate intake marker
  if (events.length === 0) {
    events.push({
      id: `evt_${eventCounter++}`,
      eventDescription: 'Incident reported in case intake',
      date: new Date().toISOString().split('T')[0],
      precision: 'approximate',
      sourceType: 'user_intake',
      partiesInvolved: ['Complainant'],
    });
  }

  // Sort events chronologically
  events.sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (isNaN(da) || isNaN(db)) return 0;
    return da - db;
  });

  // Anomaly checks
  const now = new Date();
  for (let i = 0; i < events.length; i++) {
    const evDate = new Date(events[i].date);
    if (!isNaN(evDate.getTime())) {
      // Future date detection
      if (evDate > now) {
        events[i].isAnomalous = true;
        events[i].anomalyReason = 'Date is in the future. Please verify typing error.';
        anomalies.push(`Future date detected in event "${events[i].eventDescription}": ${events[i].date}`);
      }

      // Check limitation warnings (e.g. if incident is > 2 years old for Consumer or > 3 years for contract)
      const diffYears = (now.getTime() - evDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (i === 0 && diffYears > 2.0) {
        anomalies.push(
          `Limitation Alert: The earliest recorded event occurred over ${(diffYears).toFixed(1)} years ago. For Consumer Complaints, Section 69 CPA mandates a 2-year limitation period unless condoned with sufficient cause.`
        );
      }
      if (i === 0 && diffYears > 3.0) {
        anomalies.push(
          `Limitation Alert: The earliest recorded event is over 3 years old. Civil recovery suits are generally barred after 3 years under the Limitation Act, 1963 unless fresh acknowledgement of debt exists.`
        );
      }
    }
  }

  return { events, anomalies };
}
