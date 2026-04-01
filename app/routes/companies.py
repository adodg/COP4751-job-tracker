"""Companies API routes."""
from flask import Blueprint, request, jsonify
from app.repositories import companies_repository
from mysql.connector import Error
import logging

logger = logging.getLogger(__name__)

companies_bp = Blueprint('companies', __name__, url_prefix='/api/companies')


@companies_bp.route('', methods=['GET'])
def get_companies():
    """Get all companies with optional filters."""
    try:
        # Check for query parameters
        name = request.args.get('name')
        industry = request.args.get('industry')
        city = request.args.get('city')
        state = request.args.get('state')
        
        # Filter based on query parameters
        if name:
            companies = companies_repository.search_by_name(name)
        elif industry:
            companies = companies_repository.get_by_industry(industry)
        elif city or state:
            companies = companies_repository.get_by_location(city=city, state=state)
        else:
            limit = request.args.get('limit', type=int)
            offset = request.args.get('offset', default=0, type=int)
            companies = companies_repository.get_all(limit=limit, offset=offset)
        
        return jsonify({
            'success': True,
            'data': companies,
            'count': len(companies)
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


@companies_bp.route('/<int:company_id>', methods=['GET'])
def get_company(company_id):
    """Get a specific company by ID."""
    try:
        company = companies_repository.get_by_id(company_id)
        
        if not company:
            return jsonify({
                'success': False,
                'error': 'Company not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': company
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


@companies_bp.route('', methods=['POST'])
def create_company():
    """Create a new company."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'company_name' not in data:
            return jsonify({
                'success': False,
                'error': 'company_name is required'
            }), 400
        
        # Create the company
        company_id = companies_repository.create(data)
        
        # Fetch the created company
        company = companies_repository.get_by_id(company_id)
        
        return jsonify({
            'success': True,
            'data': company,
            'message': 'Company created successfully'
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


@companies_bp.route('/<int:company_id>', methods=['PUT'])
def update_company(company_id):
    """Update an existing company."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Check if company exists
        existing = companies_repository.get_by_id(company_id)
        if not existing:
            return jsonify({
                'success': False,
                'error': 'Company not found'
            }), 404
        
        # Update the company
        success = companies_repository.update(company_id, data)
        
        if success:
            # Fetch the updated company
            company = companies_repository.get_by_id(company_id)
            return jsonify({
                'success': True,
                'data': company,
                'message': 'Company updated successfully'
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


@companies_bp.route('/<int:company_id>', methods=['DELETE'])
def delete_company(company_id):
    """Delete a company."""
    try:
        # Check if company exists
        existing = companies_repository.get_by_id(company_id)
        if not existing:
            return jsonify({
                'success': False,
                'error': 'Company not found'
            }), 404
        
        # Delete the company
        success = companies_repository.delete(company_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Company deleted successfully'
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
