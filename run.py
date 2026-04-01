"""Application entry point."""
import os
from app import create_app

# Create the Flask application
app = create_app()

if __name__ == '__main__':
    # Get host and port from environment variables
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"""
    =====================================
    Job Tracker API Server Starting...
    =====================================
    Host: {host}
    Port: {port}
    Debug: {debug}
    Database: {os.getenv('DB_NAME', 'job_tracker')}
    =====================================
    """)
    
    app.run(host=host, port=port, debug=debug)
