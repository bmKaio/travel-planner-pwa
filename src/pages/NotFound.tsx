import { useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card title="Página no encontrada" className="w-full text-center">
        <p className="text-gray-600 dark:text-gray-300">La ruta que buscas no existe.</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </Card>
    </div>
  )
}

export default NotFound
