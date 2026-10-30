const currentYear = new Date().getFullYear();

export const FAMILY_BIRTH_YEAR_OPTIONS = Array.from(
  { length: 101 },
  (_, index) => String(currentYear - index),
);

export function getApproximateAge(birthYear: string): string {
  if (!birthYear) return "";
  return `${currentYear - Number(birthYear)}歳前後`;
}

export function formatFamilyBirthYears(birthYears: string[]): string {
  const selectedYears = birthYears.filter(Boolean);
  return selectedYears.length > 0
    ? selectedYears.map((year) => `${year}年生まれ`).join("、")
    : "未登録";
}
