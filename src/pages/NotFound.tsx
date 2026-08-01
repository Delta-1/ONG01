import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page grid place-items-center py-24 text-center">
      <div>
        <p className="font-display text-6xl font-800 text-forest-300">404</p>
        <h1 className="mt-2 font-display text-2xl font-700 text-forest-800">Página não encontrada</h1>
        <p className="mt-2 text-forest-600">O caminho que você procurou não existe por aqui.</p>
        <Link to="/" className="btn-primary mt-6">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
