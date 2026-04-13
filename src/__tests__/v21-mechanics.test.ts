/**
 * V2.2 Mechanics + Domain Specificity Tests
 * Verifica que el pipeline:
 * - detecta mecánicas de dominio
 * - NO genera módulos genéricos (Core Feature, etc.)
 * - genera flujo funcional específico
 * - cubre los requisitos del input
 *
 * Ejecutar: npx tsx src/__tests__/v21-mechanics.test.ts
 */

import { analyzeInput } from '../lib/pipeline/analyze';
import { designStructure } from '../lib/pipeline/structure-designer';
import { evaluatePromptV2 } from '../lib/pipeline/evaluator';
import { assemblePrompt } from '../lib/pipeline/prompt-assembler';

// ─── CASO REAL OBLIGATORIO ──────────────────────────────────────────
// Este es el caso que debe funcionar SIEMPRE. Si falla, el motor está roto.

const REAL_CASE_INPUT =
  'Quiero una app para controlar el tiempo de uso de redes sociales en Android y iPhone, ' +
  'y que incentive hábitos saludables. La idea es que el usuario gane puntos por hacer tareas ' +
  'saludables o por reducir su uso, y que después pueda cambiar esos puntos por más tiempo en redes.';

const FORBIDDEN_NAMES = [
  'core feature', 'funcionalidad principal', 'feature principal',
  'módulo principal', 'entidad principal', 'main feature',
  'home', 'profile', 'navigation',
];

const FORBIDDEN_FLOW_PATTERNS = [
  'interactúa con el contenido',
  'navega a funcionalidad',
  'pantalla principal',
  'abre app',
  'abre la app',
];

// ─── Fixtures ────────────────────────────────────────────────────────

const FIXTURES = [
  {
    name: 'CASO REAL: App control de redes + puntos + hábitos',
    input: REAL_CASE_INPUT,
    expectMechanics: ['usage-control', 'points-system', 'habit-tracking', 'redemption'],
    expectModuleKeywords: ['tiempo', 'punto', 'hábito', 'canje'],
    expectFlowKeywords: ['monitorea', 'límite', 'tarea', 'punto', 'canj'],
    forbiddenModules: FORBIDDEN_NAMES,
    mustHaveInOutput: ['puntos', 'canje', 'tiempo', 'hábito', 'android', 'ios'],
  },
  {
    name: 'Sistema de reservas médicas',
    input:
      'Plataforma web para reservar citas médicas con doctores. El paciente selecciona ' +
      'especialidad, doctor, fecha y hora. El sistema valida disponibilidad y envía ' +
      'confirmación por email. Los doctores pueden gestionar su agenda.',
    expectMechanics: ['booking-validation', 'scheduling-rules'],
    expectModuleKeywords: ['reserva', 'cita', 'agenda', 'disponibilidad'],
    expectFlowKeywords: ['disponibilidad', 'reserva', 'confirm'],
    forbiddenModules: FORBIDDEN_NAMES,
    mustHaveInOutput: ['cita', 'doctor', 'disponibilidad'],
  },
  {
    name: 'SaaS ventas + comisiones + ranking',
    input:
      'Un SaaS para equipos de ventas que registre cada venta, calcule comisiones ' +
      'automáticas por vendedor, genere un ranking en tiempo real, y permita al gerente ' +
      'ver reportes mensuales. Quiero notificaciones cuando alguien supere su meta.',
    expectMechanics: ['sales-tracking', 'commission-system', 'gamification'],
    expectModuleKeywords: ['venta', 'comisión', 'ranking'],
    expectFlowKeywords: ['venta', 'comisión', 'ranking'],
    forbiddenModules: FORBIDDEN_NAMES,
    mustHaveInOutput: ['venta', 'comisión'],
  },
  {
    name: 'Plataforma educativa con desbloqueo por niveles',
    input:
      'Plataforma educativa donde los estudiantes completan lecciones y exámenes para ' +
      'desbloquear el siguiente nivel. Tiene sistema de puntos, badges y racha diaria. ' +
      'El profesor puede crear cursos y ver el progreso de cada estudiante.',
    expectMechanics: ['level-unlock', 'points-system', 'streak-system', 'exam-assessment'],
    expectModuleKeywords: ['nivel', 'lección', 'examen', 'punto', 'progreso'],
    expectFlowKeywords: ['nivel', 'examen', 'punto'],
    forbiddenModules: FORBIDDEN_NAMES,
    mustHaveInOutput: ['nivel', 'examen', 'punto'],
  },
];

// ─── Runner ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

for (const fixture of FIXTURES) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`TEST: ${fixture.name}`);
  console.log('═'.repeat(70));

  const analysis = analyzeInput(fixture.input);
  const design = designStructure(analysis, true);
  const prompt = assemblePrompt(design);
  const result = evaluatePromptV2(prompt.masterPrompt);
  const score = result.score;

  // 1. Check mechanics detected
  const detectedMechIds = analysis.mechanics.map(m => m.id);
  const missingMechanics = fixture.expectMechanics.filter(em => !detectedMechIds.includes(em));

  if (missingMechanics.length > 0) {
    console.log(`  ✗ FAIL: Mecánicas no detectadas: ${missingMechanics.join(', ')}`);
    console.log(`    Detectadas: ${detectedMechIds.join(', ')}`);
    failed++;
  } else {
    console.log(`  ✓ Mecánicas detectadas: ${detectedMechIds.join(', ')}`);
    passed++;
  }

  // 2. Check modules contain domain keywords
  const moduleText = design.modules.map(m => m.name.toLowerCase() + ' ' + m.responsibility.toLowerCase()).join(' ');
  const missingKeywords = fixture.expectModuleKeywords.filter(kw => !moduleText.includes(kw));

  if (missingKeywords.length > 0) {
    console.log(`  ✗ FAIL: Keywords faltantes en módulos: ${missingKeywords.join(', ')}`);
    failed++;
  } else {
    console.log(`  ✓ Módulos contienen keywords de dominio`);
    passed++;
  }

  // 3. Check no forbidden generic modules
  const moduleNamesList = design.modules.map(m => m.name.toLowerCase());
  const foundForbidden = fixture.forbiddenModules.filter(f =>
    moduleNamesList.some(n => n.includes(f))
  );

  if (foundForbidden.length > 0) {
    console.log(`  ✗ FAIL: Módulos genéricos encontrados: ${foundForbidden.join(', ')}`);
    failed++;
  } else {
    console.log(`  ✓ Sin módulos genéricos prohibidos`);
    passed++;
  }

  // 4. Check flow is domain-specific
  const flowText = design.mainFlow.join(' ').toLowerCase();
  const flowForbidden = FORBIDDEN_FLOW_PATTERNS.filter(p => flowText.includes(p));
  const flowHasKeywords = fixture.expectFlowKeywords.some(k => flowText.includes(k));

  if (flowForbidden.length > 0) {
    console.log(`  ✗ FAIL: Flujo contiene patrones genéricos: ${flowForbidden.join(', ')}`);
    failed++;
  } else if (!flowHasKeywords) {
    console.log(`  ✗ FAIL: Flujo no contiene keywords del dominio`);
    failed++;
  } else {
    console.log(`  ✓ Flujo es específico del dominio`);
    passed++;
  }

  // 5. Check system core exists
  if (!design.systemCore || design.systemCore.length < 5) {
    console.log(`  ✗ FAIL: systemCore vacío o ausente`);
    failed++;
  } else {
    console.log(`  ✓ systemCore: ${design.systemCore}`);
    passed++;
  }

  // 6. Check final prompt output contains domain terms
  const promptLower = prompt.masterPrompt.toLowerCase();
  const missingInOutput = fixture.mustHaveInOutput.filter(t => !promptLower.includes(t));
  if (missingInOutput.length > 0) {
    console.log(`  ✗ FAIL: Prompt final no contiene: ${missingInOutput.join(', ')}`);
    failed++;
  } else {
    console.log(`  ✓ Prompt final contiene todos los términos del dominio`);
    passed++;
  }

  // 7. Evaluator scores
  console.log(`  ℹ Score overall: ${score.overall}/10 | funcCov: ${score.functionalCoverage} | domSpec: ${score.domainSpecificity} | mechSpec: ${score.mechanicSpecificity}`);

  // Print modules for inspection
  console.log(`  ➤ Módulos generados:`);
  design.modules.forEach(m => console.log(`    - ${m.name}: ${m.responsibility}`));
  console.log(`  ➤ Flujo:`);
  design.mainFlow.forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
}

console.log(`\n${'═'.repeat(70)}`);
console.log(`RESULTADO: ${passed} passed, ${failed} failed de ${passed + failed} checks`);
console.log('═'.repeat(70));

if (failed > 0) {
  throw new Error(`${failed} checks failed`);
}
}
