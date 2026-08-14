import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="page">
      <div className="container">
        <div className="empty-state">
          <h3>Page not found</h3>
          <p>That page doesn't exist.</p>
          <Link to="/" className="btn btn-primary">Back to home</Link>
        </div>
      </div>
    </main>
  )
}
