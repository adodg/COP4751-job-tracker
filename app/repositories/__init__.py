"""Repositories module for table-specific database operations."""
from app.repositories.companies_repository import companies_repository
from app.repositories.jobs_repository import jobs_repository
from app.repositories.applications_repository import applications_repository
from app.repositories.contacts_repository import contacts_repository

__all__ = [
    'companies_repository',
    'jobs_repository', 
    'applications_repository',
    'contacts_repository'
]
