/**
 * V2.1 Mechanics Test Fixtures
 * Verifica que el pipeline detecta mecánicas de dominio y NO genera módulos genéricos.
 * Ejecutar: npx tsx src/__tests__/v21-mechanics.test.ts
 */

import { analyzeInput } from '../lib/pipeline/analyze';
import { designStructure } from '../lib/pipeline/structure-designer';
import { evaluatePromptV2 } from '../lib/pipeline/evaluator';
import { assemblePrompt } from '../lib/pipeline/prompt-assembler';

// ─── Fixtures ────────────────────────────────────────────────────────

const FIXTURES = [
  {
    name: 'App control de redes sociales + puntos + hábitos saludables',
    input:
      'Quiero una app que controle el tiempo de uso de redes sociales del usuario, ' +
      'que le otorgue puntos por reducir su uso, y que promueva hábitos saludables como ' +
      'ejercicio y meditación. Los puntos se pueden canjear por recompensas. ' +
      'Debe funcionar en móvil.',
    expectMechanics: ['usage-control', 'points-system', 'habit-tracking', 'redemption'],
    expectModuleKeywords: ['tiempo', 'punto', 'hábito', 'canje', 'recompensa'],
    forbiddenModules: ['Core Feature', 'Entidad Principal'],
  },
  {
    name: 'Sistema de reservas médicas',
    input:
      'Plataforma web para reservar citas médicas con doctores. El paciente selecciona ' +
      'especialidad, doctor, fecha y hora. El sistema valida disponibilidad y envía ' +
      'confirmación por email. Los doctores pueden gestionar su agenda.',
    expectMechanics: ['booking-validation', 'scheduling-rules'],
    expectModuleKeywords: ['reserva', 'cita', 'agenda', 'disponibilidad', 'doctor'],
    forbiddenModules: ['Core Feature'],
  },
  {
    name: 'SaaS ventas + comisiones + ranking',
    input:
      'Un SaaS para equipos de ventas que registre cada venta, calcule comisiones ' +
      'automáticas por vendedor, genere un ranking en tiempo real, y permita al gerente ' +
      'ver reportes mensuales. Quiero notificaciones cuando alguien supere su meta.',
    expectMechanics: ['sales-tracking', 'commission-system', 'gamification'],
    expectModuleKeywords: ['venta', 'comisión', 'ranking', 'reporte'],
    forbiddenModules: ['Core Feature'],
  },
  {
    name: 'Plataforma educativa con desbloqueo por niveles',
    input:
      'Plataforma educativa donde los estudiantes completan lecciones y exámenes para ' +
      'desbloquear el siguiente nivel. Tiene sistema de puntos, badges y racha diaria. ' +
      'El profesor puede crear cursos y ver el progreso de cada estudiante.',
    expectMechanics: ['level-unlock', 'points-system', 'streak-system', 'exam-assessment'],
    expectModuleKeywords: ['nivel', 'lección', 'examen', 'punto', 'progreso'],
    forbiddenModules: ['Core Feature'],
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

  // Check mechanics detected
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

  // Check modules contain domain keywords
  const moduleNames = design.modules.map(m => m.name.toLowerCase() + ' ' + m.responsibility.toLowerCase()).join(' ');
  const missingKeywords = fixture.expectModuleKeywords.filter(kw => !moduleNames.includes(kw));

  if (missingKeywords.length > 0) {
    console.log(`  ✗ FAIL: Keywords faltantes en módulos: ${missingKeywords.join(', ')}`);
    failed++;
  } else {
    console.log(`  ✓ Módulos contienen keywords de dominio`);
    passed++;
  }

  // Check no forbidden generic modules
  const moduleNamesList = design.modules.map(m => m.name);
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

  // Check system core exists
  if (!design.systemCore || design.systemCore.length < 5) {
    console.log(`  ✗ FAIL: systemCore vacío o ausente`);
    failed++;
  } else {
    console.log(`  ✓ systemCore: ${design.systemCore}`);
    passed++;
  }

  // Check mechanics summary exists
  if (design.mechanicsSummary.length === 0) {
    console.log(`  ✗ FAIL: mechanicsSummary vacío`);
    failed++;
  } else {
    console.log(`  ✓ mechanicsSummary: ${design.mechanicsSummary.length} entries`);
    passed++;
  }

  // Check new evaluator metrics  
  if (score.functionalCoverage < 3) {
    console.log(`  ⚠ WARN: functionalCoverage bajo: ${score.functionalCoverage}`);
  }
  if (score.domainSpecificity < 5) {
    console.log(`  ⚠ WARN: domainSpecificity bajo: ${score.domainSpecificity}`);
  }
  console.log(`  ℹ Score overall: ${score.overall}/10 | funcCov: ${score.functionalCoverage} | domSpec: ${score.domainSpecificity} | mechSpec: ${score.mechanicSpecificity}`);

  // Print modules for inspection
  console.log(`  ➤ Módulos generados:`);
  design.modules.forEach(m => console.log(`    - ${m.name}: ${m.responsibility}`));
}

console.log(`\n${'═'.repeat(70)}`);
console.log(`RESULTADO: ${passed} passed, ${failed} failed de ${passed + failed} checks`);
console.log('═'.repeat(70));

if (failed > 0) {
  throw new Error(`${failed} checks failed`);
}
