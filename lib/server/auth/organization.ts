import catalog from "./ui-organization-codes.json";

const units: Record<string, { faculty: string; programs: Record<string, string> }> = catalog;

export function organizationForCode(code: string | undefined) {
  const input = code?.trim() ?? "";
  const value = /^\d{2}$/.test(input) ? `${input}.01` : input;
  if (!/^(?:\d{2}\.\d{2}\.)?\d{2}\.\d{2}$/.test(value)) return null;

  const facultyCode = value.slice(-5);
  const unit = units[facultyCode];
  if (!unit) return null;

  return {
    facultyCode,
    faculty: unit.faculty,
    major: unit.programs[value],
    programs: unit.programs,
  };
}
