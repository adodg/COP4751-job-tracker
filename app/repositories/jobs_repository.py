"""Repository for jobs table operations."""
from typing import List, Dict, Any, Optional
from app.db.base_repository import BaseRepository
from app.db.connector import db_connector
from mysql.connector import Error
import logging

logger = logging.getLogger(__name__)


class JobsRepository(BaseRepository):
    """Repository for managing job records."""
    
    def __init__(self):
        super().__init__(
            table_name='jobs',
            primary_key='job_id',
            json_fields=['requirements']  # JSON field for job requirements
        )
    
    def get_by_company(self, company_id: int) -> List[Dict[str, Any]]:
        """
        Get all jobs for a specific company.
        
        Args:
            company_id: The company's ID
            
        Returns:
            List of jobs for the company
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE company_id = %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (company_id,))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting jobs by company: {e}")
            raise
    
    def get_by_type(self, job_type: str) -> List[Dict[str, Any]]:
        """
        Get jobs by type (Full-time, Part-time, Contract, Internship).
        
        Args:
            job_type: Type of job
            
        Returns:
            List of jobs of the specified type
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE job_type = %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (job_type,))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting jobs by type: {e}")
            raise
    
    def get_by_salary_range(self, min_salary: Optional[int] = None, 
                           max_salary: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get jobs within a salary range.
        
        Args:
            min_salary: Minimum salary (optional)
            max_salary: Maximum salary (optional)
            
        Returns:
            List of jobs within the salary range
        """
        try:
            conditions = []
            params = []
            
            if min_salary is not None:
                conditions.append("salary_min >= %s")
                params.append(min_salary)
            if max_salary is not None:
                conditions.append("salary_max <= %s")
                params.append(max_salary)
            
            if not conditions:
                return self.get_all()
            
            where_clause = " AND ".join(conditions)
            query = f"SELECT * FROM {self.table_name} WHERE {where_clause}"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting jobs by salary range: {e}")
            raise
    
    def search_by_title(self, title: str) -> List[Dict[str, Any]]:
        """
        Search jobs by title (partial match).
        
        Args:
            title: Job title to search for
            
        Returns:
            List of matching jobs
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE job_title LIKE %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (f"%{title}%",))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error searching jobs by title: {e}")
            raise


# Singleton instance
jobs_repository = JobsRepository()
