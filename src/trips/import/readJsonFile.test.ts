import { describe, expect, it } from 'vitest'
import { readJsonFile } from './readJsonFile'

const file = (content: string) => new File([content], 'data.json', { type: 'application/json' })

describe('readJsonFile', () => {
  it('parses the JSON content of a file', async () => {
    await expect(readJsonFile(file('{"a":1,"b":[true]}'))).resolves.toEqual({ a: 1, b: [true] })
  })

  it('rejects with a Spanish error when the content is not valid JSON', async () => {
    await expect(readJsonFile(file('no es json {'))).rejects.toThrow(
      'El archivo no es un JSON válido'
    )
  })

  it('rejects with the same error for an empty file', async () => {
    await expect(readJsonFile(file(''))).rejects.toThrow('El archivo no es un JSON válido')
  })
})
