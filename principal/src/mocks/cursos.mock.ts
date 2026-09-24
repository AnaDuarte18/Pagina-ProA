export interface Curso {
  ID: number;
  anio: string;
  division: string;
}

export const MOCK_CURSOS: Curso[] = [
  { ID: 1, anio: "1°", division: "A / S" },
  { ID: 2, anio: "1°", division: "B / F" },
  { ID: 3, anio: "2°", division: "A / S" },
  { ID: 4, anio: "2°", division: "B / F" },
  { ID: 5, anio: "3°", division: "A / S" },
  { ID: 6, anio: "3°", division: "B / F" },
  { ID: 7, anio: "4°", division: "A / S" },
  { ID: 8, anio: "4°", division: "B / F" },
  { ID: 9, anio: "5°", division: "A / S" },
  { ID: 10, anio: "5°", division: "B / F" },
  { ID: 11, anio: "6°", division: "A / S" },
  { ID: 12, anio: "6°", division: "B / F" },
  { ID: 13, anio: "7°", division: "A / S" },
  { ID: 14, anio: "7°", division: "B / F" },
];
