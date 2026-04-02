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
    
    def get_all(self, limit: Optional[int] = None, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get all jobs with company names.
        
        Args:
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of all jobs with company information
        """
        try:
            query = """
                SELECT j.*, c.company_name 
                FROM jobs j
                LEFT JOIN companies c ON j.company_id = c.company_id
                ORDER BY j.job_id DESC
            """
            
            if limit:
                query += f" LIMIT {limit} OFFSET {offset}"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query)
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting all jobs: {e}")
            raise
    
    def get_by_id(self, record_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a single job by ID with company name.
        
        Args:
            record_id: The job's ID
            
        Returns:
            Job record if found, None otherwise
        """
        try:
            query = """
                SELECT j.*, c.company_name 
                FROM jobs j
                LEFT JOIN companies c ON j.company_id = c.company_id
                WHERE j.job_id = %s
            """
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (record_id,))
                result = cursor.fetchone()
                return self._deserialize_json_fields(result) if result else None
                
        except Error as e:
            logger.error(f"Error getting job by ID: {e}")
            raise
    
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
    
    def get_all_skills(self) -> List[str]:
        """
        Get all unique skills across all jobs.
        
        Returns:
            Sorted list of unique skills
        """
        try:
            jobs = self.get_all()
            skills_set = set()
            
            for job in jobs:
                if job.get('requirements') and isinstance(job['requirements'], dict):
                    job_skills = job['requirements'].get('skills', [])
                    if isinstance(job_skills, list):
                        for skill in job_skills:
                            if isinstance(skill, str) and skill.strip():
                                skills_set.add(skill.strip())
            
            return sorted(list(skills_set))
                
        except Error as e:
            logger.error(f"Error getting all skills: {e}")
            raise


# Singleton instance
jobs_repository = JobsRepository()
