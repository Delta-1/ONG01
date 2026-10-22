import assert from "node:assert/strict";
import {
  resumoIndicador,
  type RegistroObservatorio,
} from "../src/lib/parceiros";
const rows = [
  { trabalhadores: 4, familias: null, producao_anual_ton: null },
  { trabalhadores: 8, familias: 0, producao_anual_ton: 1.25 },
] as RegistroObservatorio[];
assert.deepEqual(resumoIndicador(rows, "trabalhadores"), {
  total: 12,
  informados: 2,
});
assert.deepEqual(resumoIndicador(rows, "familias"), {
  total: 0,
  informados: 1,
});
assert.deepEqual(resumoIndicador(rows, "producao_anual_ton"), {
  total: 1.25,
  informados: 1,
});
console.log("PASS: indicadores preservam ausência, zero, cobertura e frações");
