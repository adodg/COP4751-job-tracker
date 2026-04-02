"""Flask application factory."""
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from app.config import get_config
from app.routes import companies_bp, jobs_bp, applications_bp, contacts_bp
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app(config_name=None):
    """
    Create and configure the Flask application.
    
    Args:
        config_name: Configuration name (development, production, testing)
        
    Returns:
        Configured Flask application instance
    """
    # Configure Flask to serve React build files
    static_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'job-tracker-frontend', 'dist')
    app = Flask(__name__, 
                static_folder=static_folder,
                static_url_path='')
    CORS(app)
    
    # Load configuration
    config_class = get_config()
    app.config.from_object(config_class)
    
    # Register blueprints
    app.register_blueprint(companies_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(applications_bp)
    app.register_blueprint(contacts_bp)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Health check endpoint
    @app.route('/health')
    def health():
        """Health check endpoint."""
        return jsonify({
            'status': 'healthy',
            'database': 'connected'
        }), 200
    
    # Serve React app at root
    @app.route('/')
    def serve_react_app():
        """Serve the React application."""
        return send_from_directory(app.static_folder, 'index.html')
    
    # Catch-all route for React Router - handles client-side routing
    @app.route('/<path:path>')
    def catch_all(path):
        """
        Catch-all route to support React Router.
        
        - If the path is an API route, let Flask handle it (will 404 if not found)
        - Otherwise, serve the React app's index.html for client-side routing
        """
        # Check if it's an API route
        if path.startswith('api/'):
            # Let Flask's 404 handler take over for missing API routes
            return jsonify({
                'success': False,
                'error': 'API endpoint not found'
            }), 404
        
        # Check if the path corresponds to a static file
        file_path = os.path.join(app.static_folder, path)
        if os.path.isfile(file_path):
            return send_from_directory(app.static_folder, path)
        
        # Otherwise, serve index.html for React Router to handle
        return send_from_directory(app.static_folder, 'index.html')
    
    logger.info("Flask application created successfully")
    
    return app


def register_error_handlers(app):
    """Register error handlers for the application."""
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors."""
        return jsonify({
            'success': False,
            'error': 'Resource not found'
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle 405 errors."""
        return jsonify({
            'success': False,
            'error': 'Method not allowed'
        }), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors."""
        logger.error(f"Internal server error: {error}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
