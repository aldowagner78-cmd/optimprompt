import type { CoreMechanic, FunctionalCoverage, SuggestedModule } from '@/types';

/**
 * Validates that detected mechanics are properly represented in the design.
 * Returns coverage analysis with detected, covered, missing concepts and warnings.
 */
export function validateCoverage(
  keyConcepts: string[],
  mechanics: CoreMechanic[],
  modules: SuggestedModule[],
  mainFlow: string[],
  entities: string[],
): FunctionalCoverage {
  const detectedConcepts: string[] = [];
  const coveredConcepts: string[] = [];
  const missingConcepts: string[] = [];
  const warnings: string[] = [];

  // Build a searchable representation of the design
  const designText = [
    ...modules.map(m => `${m.name} ${m.responsibility}`),
    ...mainFlow,
    ...entities,
  ].join(' ').toLowerCase();

  // Check mechanic coverage
  for (const mech of mechanics) {
    detectedConcepts.push(mech.label);

    // Check if the mechanic is represented in the design
    const mechWords = mech.label.toLowerCase().split(/[\s/]+/).filter(w => w.length > 3);
    const isRepresented = mechWords.some(word => designText.includes(word)) ||
      mech.subMechanics.some(sub => {
        const subWords = sub.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        return subWords.some(w => designText.includes(w));
      });

    if (isRepresented) {
      coveredConcepts.push(mech.label);
    } else {
      missingConcepts.push(mech.label);
      warnings.push(`La mecánica "${mech.label}" fue detectada en la idea pero no está representada en ningún módulo o flujo`);
    }
  }

  // Check key concepts coverage (broader check)
  for (const concept of keyConcepts) {
    if (!detectedConcepts.some(d => d.toLowerCase().includes(concept)) &&
        !detectedConcepts.includes(concept)) {
      detectedConcepts.push(concept);

      const words = concept.split(/\s+/).filter(w => w.length > 3);
      const isCovered = words.some(w => designText.includes(w));

      if (isCovered) {
        coveredConcepts.push(concept);
      } else {
        missingConcepts.push(concept);
      }
    }
  }

  // Calculate score (0-10)
  const total = detectedConcepts.length;
  const covered = coveredConcepts.length;
  const score = total > 0 ? Math.round((covered / total) * 10) : 10;

  // Generate severity warnings
  if (score < 5) {
    warnings.unshift(`⚠ Cobertura funcional crítica (${score}/10): la mayoría de mecánicas detectadas no están reflejadas en el diseño`);
  } else if (score < 7) {
    warnings.unshift(`Cobertura funcional media (${score}/10): algunas mecánicas importantes no están reflejadas`);
  }

  return {
    detectedConcepts,
    coveredConcepts,
    missingConcepts,
    warnings,
    score,
  };
}

/**
 * Given missing mechanics, generates additional modules to cover them.
 * This is the auto-correction mechanism.
 */
export function generateMissingModules(
  missingMechanics: CoreMechanic[],
  existingModules: SuggestedModule[],
): SuggestedModule[] {
  const existingNames = new Set(existingModules.map(m => m.name.toLowerCase()));
  const newModules: SuggestedModule[] = [];

  for (const mech of missingMechanics) {
    // Generate a module name from the mechanic label
    const moduleName = mech.label
      .split(/[/]+/)
      .map(part => part.trim())
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' - ');

    if (existingNames.has(moduleName.toLowerCase())) continue;

    // Build responsibility from sub-mechanics
    const responsibility = mech.subMechanics.length > 0
      ? `${mech.label}: ${mech.subMechanics.slice(0, 3).join(', ')}`
      : `Gestión y lógica de ${mech.label}`;

    newModules.push({
      name: moduleName,
      responsibility,
      dependencies: [],
    });

    existingNames.add(moduleName.toLowerCase());
  }

  return newModules;
}
