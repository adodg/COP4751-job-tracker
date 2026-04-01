"""Repository for companies table operations."""
from typing import List, Dict, Any
from app.db.base_repository import BaseRepository
from app.db.connector import db_connector
from mysql.connector import Error
import logging

logger = logging.getLogger(__name__)


class CompaniesRepository(BaseRepository):
    """Repository for managing company records."""
    
    def __init__(self):
        super().__init__(
            table_name='companies',
            primary_key='company_id',
            json_fields=[]
        )
    
    def search_by_name(self, name: str) -> List[Dict[str, Any]]:
        """
        Search companies by name (partial match).
        
        Args:
            name: Company name to search for
            
        Returns:
            List of matching companies
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE company_name LIKE %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (f"%{name}%",))
                return cursor.fetchall()
                
        except Error as e:
            logger.error(f"Error searching companies by name: {e}")
            raise
    
    def get_by_industry(self, industry: str) -> List[Dict[str, Any]]:
        """
        Get companies by industry.
        
        Args:
            industry: Industry name
            
        Returns:
            List of companies in the specified industry
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE industry = %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (industry,))
                return cursor.fetchall()
                
        except Error as e:
            logger.error(f"Error getting companies by industry: {e}")
            raise
    
    def get_by_location(self, city: str = None, state: str = None) -> List[Dict[str, Any]]:
        """
        Get companies by location.
        
        Args:
            city: City name (optional)
            state: State name (optional)
            
        Returns:
            List of companies in the specified location
        """
        try:
            conditions = []
            params = []
            
            if city:
                conditions.append("city = %s")
                params.append(city)
            if state:
                conditions.append("state = %s")
                params.append(state)
            
            if not conditions:
                return []
            
            where_clause = " AND ".join(conditions)
            query = f"SELECT * FROM {self.table_name} WHERE {where_clause}"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
                
        except Error as e:
            logger.error(f"Error getting companies by location: {e}")
            raise


# Singleton instance
companies_repository = CompaniesRepository()
