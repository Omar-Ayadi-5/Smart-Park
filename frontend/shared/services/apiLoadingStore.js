let pending = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn(pending));
}

export function subscribeApiLoading(listener) {
  listeners.add(listener);
  // On pousse immédiatement l’état courant pour éviter un “flash” à 0
  // quand un composant s’abonne alors que des requêtes sont déjà en cours.
  listener(pending);
  return () => listeners.delete(listener);
}

export function beginApiLoading() {
  pending += 1;
  emit();
}

export function endApiLoading() {
  // Sécurité: on ne descend jamais en dessous de 0 (erreur de double "end")
  pending = Math.max(0, pending - 1);
  emit();
}

let mutex = Promise.resolve();

/**
 * Sérialise les appels API “trackés” globalement.
 *
 * Objectif: éviter d’avoir plusieurs overlays/états “loading global” en parallèle
 * et rendre le flux plus prévisible (une requête attend la fin de la précédente).
 *
 * Important: ce mutex ne doit être utilisé que pour les appels qui déclenchent
 * le chargement global (sinon on pénalise inutilement des appels secondaires).
 *
 * @returns {() => void} À appeler en fin de cycle HTTP (succès ou erreur).
 */
export async function acquireApiMutex() {
  let release;
  const next = new Promise((resolve) => {
    release = resolve;
  });
  const prev = mutex;
  mutex = prev.then(() => next);
  await prev;
  return release;
}
