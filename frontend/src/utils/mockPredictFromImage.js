/**
 * Simulates an HTTP request for molecule prediction from image.
 * Returns a Promise that resolves to a fake smiles string, or rejects for error simulation.
 *
 * @param {string} imageSrc - The image data URL (not used here, but mimics real usage)
 * @returns {Promise<{ smiles: string }>} - fake prediction
 */
export async function mockPredictFromImage(imageSrc) {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Randomly choose success or error (90% success here)
      if (Math.random() < 0.9) {
        // Success: return a fake SMILES string
        resolve({ smiles: "C1=CC=CC=C1" });
      } else {
        // Failure: return error message
        reject({ error: "Simulated prediction error." });
      }
    }, 3200); 
  });
}
