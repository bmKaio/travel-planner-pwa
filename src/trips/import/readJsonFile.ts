/** Reads a user-picked file and parses it as JSON. Kept inside src/trips (no legacy imports). */
export async function readJsonFile(file: File): Promise<unknown> {
  const text = await file.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('El archivo no es un JSON válido')
  }
}
