"""Contacts API routes."""
from flask import Blueprint, request, jsonify
from app.repositories import contacts_repository
from mysql.connector import Error
import logging

logger = logging.getLogger(__name__)

contacts_bp = Blueprint('contacts', __name__, url_prefix='/api/contacts')


@contacts_bp.route('', methods=['GET'])
def get_contacts():
    """Get all contacts with optional filters."""
    try:
        # Check for query parameters
        company_id = request.args.get('company_id', type=int)
        name = request.args.get('name')
        email = request.args.get('email')
        
        # Filter based on query parameters
        if company_id:
            contacts = contacts_repository.get_by_company(company_id)
        elif name:
            contacts = contacts_repository.search_by_name(name)
        elif email:
            contacts = contacts_repository.get_by_email(email)
        else:
            limit = request.args.get('limit', type=int)
            offset = request.args.get('offset', default=0, type=int)
            contacts = contacts_repository.get_all(limit=limit, offset=offset)
        
        return jsonify({
            'success': True,
            'data': contacts,
            'count': len(contacts)
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


@contacts_bp.route('/<int:contact_id>', methods=['GET'])
def get_contact(contact_id):
    """Get a specific contact by ID."""
    try:
        contact = contacts_repository.get_by_id(contact_id)
        
        if not contact:
            return jsonify({
                'success': False,
                'error': 'Contact not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': contact
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


@contacts_bp.route('', methods=['POST'])
def create_contact():
    """Create a new contact."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'contact_name' not in data:
            return jsonify({
                'success': False,
                'error': 'contact_name is required'
            }), 400
        
        # Create the contact
        contact_id = contacts_repository.create(data)
        
        # Fetch the created contact
        contact = contacts_repository.get_by_id(contact_id)
        
        return jsonify({
            'success': True,
            'data': contact,
            'message': 'Contact created successfully'
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


@contacts_bp.route('/<int:contact_id>', methods=['PUT'])
def update_contact(contact_id):
    """Update an existing contact."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Check if contact exists
        existing = contacts_repository.get_by_id(contact_id)
        if not existing:
            return jsonify({
                'success': False,
                'error': 'Contact not found'
            }), 404
        
        # Update the contact
        success = contacts_repository.update(contact_id, data)
        
        if success:
            # Fetch the updated contact
            contact = contacts_repository.get_by_id(contact_id)
            return jsonify({
                'success': True,
                'data': contact,
                'message': 'Contact updated successfully'
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


@contacts_bp.route('/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    """Delete a contact."""
    try:
        # Check if contact exists
        existing = contacts_repository.get_by_id(contact_id)
        if not existing:
            return jsonify({
                'success': False,
                'error': 'Contact not found'
            }), 404
        
        # Delete the contact
        success = contacts_repository.delete(contact_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Contact deleted successfully'
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
