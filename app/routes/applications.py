"""Applications API routes."""
from flask import Blueprint, request, jsonify
from app.repositories import applications_repository
from mysql.connector import Error
import logging

logger = logging.getLogger(__name__)

applications_bp = Blueprint('applications', __name__, url_prefix='/api/applications')


@applications_bp.route('', methods=['GET'])
def get_applications():
    """Get all applications with optional filters."""
    try:
        # Check for query parameters
        job_id = request.args.get('job_id', type=int)
        status = request.args.get('status')
        recent = request.args.get('recent', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Filter based on query parameters
        if job_id:
            applications = applications_repository.get_by_job(job_id)
        elif status:
            applications = applications_repository.get_by_status(status)
        elif recent:
            applications = applications_repository.get_recent(recent)
        elif start_date and end_date:
            applications = applications_repository.get_by_date_range(start_date, end_date)
        else:
            limit = request.args.get('limit', type=int)
            offset = request.args.get('offset', default=0, type=int)
            applications = applications_repository.get_all(limit=limit, offset=offset)
        
        return jsonify({
            'success': True,
            'data': applications,
            'count': len(applications)
        }), 200
        
    except Error as e:
        logger.error(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred'
        }), 500


@applications_bp.route('/<int:application_id>', methods=['GET'])
def get_application(application_id):
    """Get a specific application by ID."""
    try:
        application = applications_repository.get_by_id(application_id)
        
        if not application:
            return jsonify({
                'success': False,
                'error': 'Application not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': application
        }), 200
        
    except Error as e:
        logger.error(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred'
        }), 500


@applications_bp.route('', methods=['POST'])
def create_application():
    """Create a new application."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'application_date' not in data:
            return jsonify({
                'success': False,
                'error': 'application_date is required'
            }), 400
        
        # Create the application
        application_id = applications_repository.create(data)
        
        # Fetch the created application
        application = applications_repository.get_by_id(application_id)
        
        return jsonify({
            'success': True,
            'data': application,
            'message': 'Application created successfully'
        }), 201
        
    except Error as e:
        logger.error(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred'
        }), 500


@applications_bp.route('/<int:application_id>', methods=['PUT'])
def update_application(application_id):
    """Update an existing application."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Check if application exists
        existing = applications_repository.get_by_id(application_id)
        if not existing:
            return jsonify({
                'success': False,
                'error': 'Application not found'
            }), 404
        
        # Update the application
        success = applications_repository.update(application_id, data)
        
        if success:
            # Fetch the updated application
            application = applications_repository.get_by_id(application_id)
            return jsonify({
                'success': True,
                'data': application,
                'message': 'Application updated successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Update failed'
            }), 500
        
    except Error as e:
        logger.error(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred'
        }), 500


@applications_bp.route('/<int:application_id>', methods=['DELETE'])
def delete_application(application_id):
    """Delete an application."""
    try:
        # Check if application exists
        existing = applications_repository.get_by_id(application_id)
        if not existing:
            return jsonify({
                'success': False,
                'error': 'Application not found'
            }), 404
        
        # Delete the application
        success = applications_repository.delete(application_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Application deleted successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Delete failed'
            }), 500
        
    except Error as e:
        logger.error(f"Database error: {e}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred'
        }), 500
