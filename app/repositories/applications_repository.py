"""Repository for applications table operations."""
from typing import List, Dict, Any
from app.db.base_repository import BaseRepository
from app.db.connector import db_connector
from mysql.connector import Error
import logging

logger = logging.getLogger(__name__)


class ApplicationsRepository(BaseRepository):
    """Repository for managing job application records."""
    
    def __init__(self):
        super().__init__(
            table_name='applications',
            primary_key='application_id',
            json_fields=['interview_data']  # JSON field for interview information
        )
    
    def get_by_job(self, job_id: int) -> List[Dict[str, Any]]:
        """
        Get all applications for a specific job.
        
        Args:
            job_id: The job's ID
            
        Returns:
            List of applications for the job
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE job_id = %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (job_id,))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting applications by job: {e}")
            raise
    
    def get_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        Get applications by status (Applied, Screening, Interview, Offer, Rejected, Withdrawn).
        
        Args:
            status: Application status
            
        Returns:
            List of applications with the specified status
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE status = %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (status,))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting applications by status: {e}")
            raise
    
    def get_recent(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get most recent applications.
        
        Args:
            limit: Number of applications to return
            
        Returns:
            List of recent applications
        """
        try:
            query = f"SELECT * FROM {self.table_name} ORDER BY application_date DESC LIMIT %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (limit,))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting recent applications: {e}")
            raise
    
    def get_by_date_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Get applications within a date range.
        
        Args:
            start_date: Start date (YYYY-MM-DD format)
            end_date: End date (YYYY-MM-DD format)
            
        Returns:
            List of applications within the date range
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE application_date BETWEEN %s AND %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (start_date, end_date))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting applications by date range: {e}")
            raise


# Singleton instance
applications_repository = ApplicationsRepository()
