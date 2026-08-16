export type ExamDescriptor = { id: string; label: string };

function examChronologyValue(examId: string) {
  const match = /^(HS|FS)(\d{2})$/.exec(examId);
  if (!match) return Number.NEGATIVE_INFINITY;

  const semester = match[1];
  const year = 2000 + Number(match[2]);

  // FS exams are held in summer of the named year. HS exams are held at the
  // end of the autumn semester, i.e. in January/February of the following year.
  return semester === "HS"
    ? (year + 1) * 12 + 1
    : year * 12 + 8;
}

export function sortExamsChronologically<T extends ExamDescriptor>(exams: T[]): T[] {
  return exams.sort((left, right) => {
    const chronologyDifference = examChronologyValue(right.id) - examChronologyValue(left.id);
    if (chronologyDifference !== 0) return chronologyDifference;
    return left.label.localeCompare(right.label);
  });
}
