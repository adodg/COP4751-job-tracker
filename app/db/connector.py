"""
MySQL Database Connector with Connection Pooling
Manages database connections using environment variables for configuration.
"""
import os
import logging
from mysql.connector import pooling, Error
from contextlib import contextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConnector:
    """Singleton database connector with connection pooling."""
    
    _instance = None
    _pool = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnector, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the connection pool if not already created."""
        if self._pool is None:
            self._create_pool()
    
    def _create_pool(self):
        """Create a connection pool with environment-based configuration."""
        try:
            pool_config = {
                'pool_name': 'job_tracker_pool',
                'pool_size': int(os.getenv('DB_POOL_SIZE', 5)),
                'pool_reset_session': True,
                'host': os.getenv('DB_HOST', 'localhost'),
                'user': os.getenv('DB_USER', 'root'),
                'password': os.getenv('DB_PASSWORD', ''),
                'database': os.getenv('DB_NAME', 'job_tracker'),
                'autocommit': False
            }
            
            self._pool = pooling.MySQLConnectionPool(**pool_config)
            logger.info(f"Database connection pool created successfully for {pool_config['database']}")
            
        except Error as e:
            logger.error(f"Error creating connection pool: {e}")
            raise
    
    def get_connection(self):
        """Get a connection from the pool."""
        try:
            return self._pool.get_connection()
        except Error as e:
            logger.error(f"Error getting connection from pool: {e}")
            raise
    
    @contextmanager
    def get_cursor(self, dictionary=True):
        """
        Context manager for database operations.
        
        Args:
            dictionary: If True, returns rows as dictionaries. Otherwise as tuples.
            
        Yields:
            cursor: Database cursor for executing queries
            
        Example:
            with db.get_cursor() as cursor:
                cursor.execute("SELECT * FROM companies")
                results = cursor.fetchall()
        """
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(dictionary=dictionary)
            yield cursor
            connection.commit()
        except Error as e:
            if connection:
                connection.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()


# Singleton instance
db_connector = DatabaseConnector()
