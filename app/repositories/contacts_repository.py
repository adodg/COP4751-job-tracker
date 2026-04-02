"""Repository for contacts table operations."""
from typing import List, Dict, Any, Optional
from app.db.base_repository import BaseRepository
from app.db.connector import db_connector
from mysql.connector import Error
import logging

logger = logging.getLogger(__name__)


class ContactsRepository(BaseRepository):
    """Repository for managing contact records."""
    
    def __init__(self):
        super().__init__(
            table_name='contacts',
            primary_key='contact_id',
            json_fields=[]
        )
    
    def get_all(self, limit: Optional[int] = None, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get all contacts with company names.
        
        Args:
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of all contacts with company information
        """
        try:
            query = """
                SELECT c.*, co.company_name 
                FROM contacts c
                LEFT JOIN companies co ON c.company_id = co.company_id
                ORDER BY c.contact_id DESC
            """
            params = []
            
            if limit is not None:
                query += " LIMIT %s OFFSET %s"
                params = [limit, offset]
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting all contacts: {e}")
            raise
    
    def get_by_id(self, record_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a single contact by ID with company name.
        
        Args:
            record_id: The contact's ID
            
        Returns:
            Contact record if found, None otherwise
        """
        try:
            query = """
                SELECT c.*, co.company_name 
                FROM contacts c
                LEFT JOIN companies co ON c.company_id = co.company_id
                WHERE c.contact_id = %s
            """
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (record_id,))
                result = cursor.fetchone()
                return self._deserialize_json_fields(result) if result else None
                
        except Error as e:
            logger.error(f"Error getting contact by ID: {e}")
            raise
    
    def get_by_company(self, company_id: int) -> List[Dict[str, Any]]:
        """
        Get all contacts for a specific company.
        
        Args:
            company_id: The company's ID
            
        Returns:
            List of contacts for the company
        """
        try:
            query = """
                SELECT c.*, co.company_name 
                FROM contacts c
                LEFT JOIN companies co ON c.company_id = co.company_id
                WHERE c.company_id = %s
            """
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (company_id,))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting contacts by company: {e}")
            raise
    
    def search_by_name(self, name: str) -> List[Dict[str, Any]]:
        """
        Search contacts by name (partial match).
        
        Args:
            name: Contact name to search for
            
        Returns:
            List of matching contacts
        """
        try:
            query = """
                SELECT c.*, co.company_name 
                FROM contacts c
                LEFT JOIN companies co ON c.company_id = co.company_id
                WHERE c.contact_name LIKE %s
            """
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (f"%{name}%",))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error searching contacts by name: {e}")
            raise
    
    def get_by_email(self, email: str) -> List[Dict[str, Any]]:
        """
        Get contacts by email.
        
        Args:
            email: Email address
            
        Returns:
            List of contacts with the specified email
        """
        try:
            query = """
                SELECT c.*, co.company_name 
                FROM contacts c
                LEFT JOIN companies co ON c.company_id = co.company_id
                WHERE c.email = %s
            """
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (email,))
                results = cursor.fetchall()
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting contacts by email: {e}")
            raise


# Singleton instance
contacts_repository = ContactsRepository()
