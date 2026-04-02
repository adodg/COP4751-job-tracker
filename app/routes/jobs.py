"""Jobs API routes."""
from flask import Blueprint, request, jsonify
from app.repositories import jobs_repository
from mysql.connector import Error
import logging

logger = logging.getLogger(__name__)

jobs_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')


@jobs_bp.route('', methods=['GET'])
def get_jobs():
    """Get all jobs with optional filters."""
    try:
        # Check for query parameters
        company_id = request.args.get('company_id', type=int)
        job_type = request.args.get('job_type')
        title = request.args.get('title')
        min_salary = request.args.get('min_salary', type=int)
        max_salary = request.args.get('max_salary', type=int)
        
        # Filter based on query parameters
        if company_id:
            jobs = jobs_repository.get_by_company(company_id)
        elif job_type:
            jobs = jobs_repository.get_by_type(job_type)
        elif title:
            jobs = jobs_repository.search_by_title(title)
        elif min_salary or max_salary:
            jobs = jobs_repository.get_by_salary_range(min_salary, max_salary)
        else:
            limit = request.args.get('limit', type=int)
            offset = request.args.get('offset', default=0, type=int)
            jobs = jobs_repository.get_all(limit=limit, offset=offset)
        
        return jsonify({
            'success': True,
            'data': jobs,
            'count': len(jobs)
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


@jobs_bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """Get a specific job by ID."""
    try:
        job = jobs_repository.get_by_id(job_id)
        
        if not job:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': job
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


@jobs_bp.route('', methods=['POST'])
def create_job():
    """Create a new job."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'job_title' not in data:
            return jsonify({
                'success': False,
                'error': 'job_title is required'
            }), 400
        
        # Create the job
        job_id = jobs_repository.create(data)
        
        # Fetch the created job
        job = jobs_repository.get_by_id(job_id)
        
        return jsonify({
            'success': True,
            'data': job,
            'message': 'Job created successfully'
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


@jobs_bp.route('/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    """Update an existing job."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Check if job exists
        existing = jobs_repository.get_by_id(job_id)
        if not existing:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        # Remove fields that come from JOIN but aren't in the jobs table
        data = {k: v for k, v in data.items() if k != 'company_name'}
        
        # Update the job
        success = jobs_repository.update(job_id, data)
        
        if success:
            # Fetch the updated job
            job = jobs_repository.get_by_id(job_id)
            return jsonify({
                'success': True,
                'data': job,
                'message': 'Job updated successfully'
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


@jobs_bp.route('/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    """Delete a job."""
    try:
        # Check if job exists
        existing = jobs_repository.get_by_id(job_id)
        if not existing:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404
        
        # Delete the job
        success = jobs_repository.delete(job_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Job deleted successfully'
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


@jobs_bp.route('/skills', methods=['GET'])
def get_all_skills():
    """Get all unique skills across all jobs."""
    try:
        skills = jobs_repository.get_all_skills()
        
        return jsonify({
            'success': True,
            'data': skills,
            'count': len(skills)
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
