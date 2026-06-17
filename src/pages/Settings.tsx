import { useRef, useState, useEffect } from 'react'
import { Moon, Sun, Download, Upload, RotateCcw } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { exportAllDataToFile, importDataFromFile } from '../utils/export'
import { resetDatabase } from '../db'

function Settings() {
  const [isDark, setIsDark] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportAllDataToFile()
      showMessage('Datos exportados correctamente', 'success')
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Error al exportar', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      const result = await importDataFromFile(file, { merge: false })
      if (result.errors.length > 0) {
        showMessage(`Importado con advertencias: ${result.errors.join('; ')}`, 'error')
      } else {
        showMessage(`Importados ${result.imported} registros correctamente`, 'success')
      }
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Error al importar', 'error')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleReset = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres restaurar los datos iniciales? Se perderán todos los cambios realizados.'
    )
    if (!confirmed) return

    try {
      setIsResetting(true)
      await resetDatabase()
      showMessage('Base de datos restaurada a los valores iniciales', 'success')
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Error al restaurar', 'error')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Configuración">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="h-5 w-5 text-gray-500" aria-hidden="true" />
            ) : (
              <Sun className="h-5 w-5 text-travel-amber-500" aria-hidden="true" />
            )}
            <span className="text-gray-800 dark:text-gray-200">
              Tema {isDark ? 'oscuro' : 'claro'}
            </span>
          </div>
          <Button variant="secondary" onClick={toggleTheme} aria-label="Cambiar tema">
            Cambiar
          </Button>
        </div>
      </Card>

      <Card title="Gestión de datos">
        <div className="space-y-3">
          <Button
            onClick={handleExport}
            isFullWidth
            disabled={isExporting}
            aria-label="Exportar datos"
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            {isExporting ? 'Exportando...' : 'Exportar datos'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleImportClick}
            isFullWidth
            disabled={isImporting}
            aria-label="Importar datos"
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            {isImporting ? 'Importando...' : 'Importar datos'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Seleccionar archivo de datos"
          />

          <Button
            variant="danger"
            onClick={handleReset}
            isFullWidth
            disabled={isResetting}
            aria-label="Restaurar datos iniciales"
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            {isResetting ? 'Restaurando...' : 'Restaurar datos iniciales'}
          </Button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            La exportación incluye toda la base de datos en formato JSON. La importación reemplaza
            los datos actuales.
          </p>
        </div>

        {message && (
          <div
            className={`mt-4 rounded-xl p-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}
            role="status"
            aria-live="polite"
          >
            {message.text}
          </div>
        )}
      </Card>
    </div>
  )
}

export default Settings
