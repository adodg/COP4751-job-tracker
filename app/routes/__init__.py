"""Routes module for API endpoints."""
from app.routes.companies import companies_bp
from app.routes.jobs import jobs_bp
from app.routes.applications import applications_bp
from app.routes.contacts import contacts_bp

__all__ = [
    'companies_bp',
    'jobs_bp',
    'applications_bp',
    'contacts_bp'
]
