"""Repository for contacts table operations."""
from typing import List, Dict, Any
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
    
    def get_by_company(self, company_id: int) -> List[Dict[str, Any]]:
        """
        Get all contacts for a specific company.
        
        Args:
            company_id: The company's ID
            
        Returns:
            List of contacts for the company
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE company_id = %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (company_id,))
                return cursor.fetchall()
                
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
            query = f"SELECT * FROM {self.table_name} WHERE contact_name LIKE %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (f"%{name}%",))
                return cursor.fetchall()
                
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
            query = f"SELECT * FROM {self.table_name} WHERE email = %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (email,))
                return cursor.fetchall()
                
        except Error as e:
            logger.error(f"Error getting contacts by email: {e}")
            raise


# Singleton instance
contacts_repository = ContactsRepository()
