"""
Base Repository Class with Generic CRUD Operations
Provides reusable database operations for all tables.
"""
import json
import logging
from typing import List, Dict, Optional, Any
from mysql.connector import Error
from app.db.connector import db_connector

logger = logging.getLogger(__name__)


class BaseRepository:
    """Base repository class providing generic CRUD operations."""
    
    def __init__(self, table_name: str, primary_key: str, json_fields: List[str] = None):
        """
        Initialize the repository.
        
        Args:
            table_name: Name of the database table
            primary_key: Name of the primary key column
            json_fields: List of column names that store JSON data
        """
        self.table_name = table_name
        self.primary_key = primary_key
        self.json_fields = json_fields or []
    
    def _serialize_json_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert JSON fields from dict/list to JSON string."""
        result = data.copy()
        for field in self.json_fields:
            if field in result and result[field] is not None:
                if isinstance(result[field], (dict, list)):
                    result[field] = json.dumps(result[field])
        return result
    
    def _deserialize_json_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert JSON fields from JSON string to dict/list."""
        result = data.copy()
        for field in self.json_fields:
            if field in result and result[field] is not None:
                if isinstance(result[field], str):
                    try:
                        result[field] = json.loads(result[field])
                    except json.JSONDecodeError:
                        logger.warning(f"Failed to decode JSON field '{field}': {result[field]}")
        return result
    
    def create(self, data: Dict[str, Any]) -> Optional[int]:
        """
        Create a new record.
        
        Args:
            data: Dictionary of column names and values
            
        Returns:
            The ID of the newly created record, or None if failed
        """
        try:
            # Serialize JSON fields
            data = self._serialize_json_fields(data)
            
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            query = f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders})"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, list(data.values()))
                return cursor.lastrowid
                
        except Error as e:
            logger.error(f"Error creating record in {self.table_name}: {e}")
            raise
    
    def get_by_id(self, record_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a record by its primary key.
        
        Args:
            record_id: The primary key value
            
        Returns:
            Dictionary representing the record, or None if not found
        """
        try:
            query = f"SELECT * FROM {self.table_name} WHERE {self.primary_key} = %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (record_id,))
                result = cursor.fetchone()
                
                if result:
                    return self._deserialize_json_fields(result)
                return None
                
        except Error as e:
            logger.error(f"Error getting record from {self.table_name}: {e}")
            raise
    
    def get_all(self, limit: Optional[int] = None, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get all records from the table.
        
        Args:
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of dictionaries representing records
        """
        try:
            query = f"SELECT * FROM {self.table_name}"
            params = []
            
            if limit is not None:
                query += " LIMIT %s OFFSET %s"
                params = [limit, offset]
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()
                
                return [self._deserialize_json_fields(row) for row in results]
                
        except Error as e:
            logger.error(f"Error getting all records from {self.table_name}: {e}")
            raise
    
    def update(self, record_id: int, data: Dict[str, Any]) -> bool:
        """
        Update a record.
        
        Args:
            record_id: The primary key value
            data: Dictionary of column names and new values
            
        Returns:
            True if updated successfully, False otherwise
        """
        try:
            # Remove primary key from data if present
            data = {k: v for k, v in data.items() if k != self.primary_key}
            
            if not data:
                return False
            
            # Serialize JSON fields
            data = self._serialize_json_fields(data)
            
            set_clause = ', '.join([f"{col} = %s" for col in data.keys()])
            query = f"UPDATE {self.table_name} SET {set_clause} WHERE {self.primary_key} = %s"
            
            values = list(data.values()) + [record_id]
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, values)
                # Return True even if no rows changed (update with same values is still successful)
                return True
                
        except Error as e:
            logger.error(f"Error updating record in {self.table_name}: {e}")
            raise
    
    def delete(self, record_id: int) -> bool:
        """
        Delete a record.
        
        Args:
            record_id: The primary key value
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            query = f"DELETE FROM {self.table_name} WHERE {self.primary_key} = %s"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query, (record_id,))
                return cursor.rowcount > 0
                
        except Error as e:
            logger.error(f"Error deleting record from {self.table_name}: {e}")
            raise
    
    def count(self) -> int:
        """
        Count total records in the table.
        
        Returns:
            Total number of records
        """
        try:
            query = f"SELECT COUNT(*) as total FROM {self.table_name}"
            
            with db_connector.get_cursor() as cursor:
                cursor.execute(query)
                result = cursor.fetchone()
                return result['total'] if result else 0
                
        except Error as e:
            logger.error(f"Error counting records in {self.table_name}: {e}")
            raise
