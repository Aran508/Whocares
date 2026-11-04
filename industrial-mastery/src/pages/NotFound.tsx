import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-10 text-center">
      <p className="section-title">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-navy-500">The page you are looking for does not exist or has moved.</p>
      <div className="mt-5 flex justify-center gap-2">
        <Link to="/" className="btn-primary">Go to dashboard</Link>
        <Link to="/academy" className="btn-secondary">Learning Academy</Link>
      </div>
    </div>
  );
}
