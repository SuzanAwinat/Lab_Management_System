from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import pandas as pd
from sqlalchemy import func
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lab_management.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
cors = CORS(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # admin, manager, user
    campus_id = db.Column(db.Integer, db.ForeignKey('campus.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    campus = db.relationship('Campus', backref='users')
    bookings = db.relationship('Booking', backref='user', lazy=True)

class Campus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(20))
    budget_allocated = db.Column(db.Float, default=0.0)
    budget_used = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    labs = db.relationship('Lab', backref='campus', lazy=True)

class Lab(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    capacity = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(200))
    equipment_list = db.Column(db.Text)  # JSON string
    hourly_rate = db.Column(db.Float, default=0.0)
    campus_id = db.Column(db.Integer, db.ForeignKey('campus.id'), nullable=False)
    status = db.Column(db.String(20), default='active')  # active, maintenance, inactive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='lab', lazy=True)
    inventory_items = db.relationship('InventoryItem', backref='lab', lazy=True)

class InventoryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    quantity_total = db.Column(db.Integer, nullable=False)
    quantity_available = db.Column(db.Integer, nullable=False)
    unit_cost = db.Column(db.Float, default=0.0)
    supplier = db.Column(db.String(100))
    purchase_date = db.Column(db.Date)
    warranty_expiry = db.Column(db.Date)
    lab_id = db.Column(db.Integer, db.ForeignKey('lab.id'), nullable=False)
    status = db.Column(db.String(20), default='active')  # active, maintenance, retired
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    lab_id = db.Column(db.Integer, db.ForeignKey('lab.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    purpose = db.Column(db.String(200))
    participants = db.Column(db.Integer, default=1)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    cost = db.Column(db.Float, default=0.0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class BudgetTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campus_id = db.Column(db.Integer, db.ForeignKey('campus.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=True)
    transaction_type = db.Column(db.String(20), nullable=False)  # booking, maintenance, purchase, allocation
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    campus = db.relationship('Campus', backref='budget_transactions')
    booking = db.relationship('Booking', backref='budget_transactions')

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data.get('role', 'user'),
        campus_id=data.get('campus_id')
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'campus_id': user.campus_id
            }
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

# Campus Management Routes
@app.route('/api/campuses', methods=['GET'])
@jwt_required()
def get_campuses():
    campuses = Campus.query.all()
    return jsonify([{
        'id': campus.id,
        'name': campus.name,
        'location': campus.location,
        'contact_email': campus.contact_email,
        'contact_phone': campus.contact_phone,
        'budget_allocated': campus.budget_allocated,
        'budget_used': campus.budget_used,
        'labs_count': len(campus.labs)
    } for campus in campuses])

@app.route('/api/campuses', methods=['POST'])
@jwt_required()
def create_campus():
    data = request.get_json()
    campus = Campus(
        name=data['name'],
        location=data['location'],
        contact_email=data.get('contact_email'),
        contact_phone=data.get('contact_phone'),
        budget_allocated=data.get('budget_allocated', 0.0)
    )
    
    db.session.add(campus)
    db.session.commit()
    
    return jsonify({'message': 'Campus created successfully', 'id': campus.id}), 201

# Lab Management Routes
@app.route('/api/labs', methods=['GET'])
@jwt_required()
def get_labs():
    campus_id = request.args.get('campus_id')
    query = Lab.query
    
    if campus_id:
        query = query.filter_by(campus_id=campus_id)
    
    labs = query.all()
    return jsonify([{
        'id': lab.id,
        'name': lab.name,
        'description': lab.description,
        'capacity': lab.capacity,
        'location': lab.location,
        'equipment_list': json.loads(lab.equipment_list) if lab.equipment_list else [],
        'hourly_rate': lab.hourly_rate,
        'campus_id': lab.campus_id,
        'campus_name': lab.campus.name,
        'status': lab.status
    } for lab in labs])

@app.route('/api/labs', methods=['POST'])
@jwt_required()
def create_lab():
    data = request.get_json()
    lab = Lab(
        name=data['name'],
        description=data.get('description'),
        capacity=data['capacity'],
        location=data.get('location'),
        equipment_list=json.dumps(data.get('equipment_list', [])),
        hourly_rate=data.get('hourly_rate', 0.0),
        campus_id=data['campus_id'],
        status=data.get('status', 'active')
    )
    
    db.session.add(lab)
    db.session.commit()
    
    return jsonify({'message': 'Lab created successfully', 'id': lab.id}), 201

# Inventory Management Routes
@app.route('/api/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    lab_id = request.args.get('lab_id')
    campus_id = request.args.get('campus_id')
    
    query = InventoryItem.query
    
    if lab_id:
        query = query.filter_by(lab_id=lab_id)
    elif campus_id:
        query = query.join(Lab).filter(Lab.campus_id == campus_id)
    
    items = query.all()
    return jsonify([{
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'category': item.category,
        'quantity_total': item.quantity_total,
        'quantity_available': item.quantity_available,
        'unit_cost': item.unit_cost,
        'supplier': item.supplier,
        'purchase_date': item.purchase_date.isoformat() if item.purchase_date else None,
        'warranty_expiry': item.warranty_expiry.isoformat() if item.warranty_expiry else None,
        'lab_id': item.lab_id,
        'lab_name': item.lab.name,
        'status': item.status
    } for item in items])

@app.route('/api/inventory', methods=['POST'])
@jwt_required()
def create_inventory_item():
    data = request.get_json()
    item = InventoryItem(
        name=data['name'],
        description=data.get('description'),
        category=data.get('category'),
        quantity_total=data['quantity_total'],
        quantity_available=data.get('quantity_available', data['quantity_total']),
        unit_cost=data.get('unit_cost', 0.0),
        supplier=data.get('supplier'),
        purchase_date=datetime.strptime(data['purchase_date'], '%Y-%m-%d').date() if data.get('purchase_date') else None,
        warranty_expiry=datetime.strptime(data['warranty_expiry'], '%Y-%m-%d').date() if data.get('warranty_expiry') else None,
        lab_id=data['lab_id'],
        status=data.get('status', 'active')
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify({'message': 'Inventory item created successfully', 'id': item.id}), 201

# Booking Management Routes
@app.route('/api/bookings', methods=['GET'])
@jwt_required()
def get_bookings():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    query = Booking.query
    
    # Filter based on user role and campus
    if user.role == 'user':
        query = query.filter_by(user_id=user_id)
    elif user.role == 'manager' and user.campus_id:
        query = query.join(Lab).filter(Lab.campus_id == user.campus_id)
    
    bookings = query.all()
    return jsonify([{
        'id': booking.id,
        'user_id': booking.user_id,
        'user_name': booking.user.username,
        'lab_id': booking.lab_id,
        'lab_name': booking.lab.name,
        'start_time': booking.start_time.isoformat(),
        'end_time': booking.end_time.isoformat(),
        'purpose': booking.purpose,
        'participants': booking.participants,
        'status': booking.status,
        'cost': booking.cost,
        'notes': booking.notes
    } for booking in bookings])

@app.route('/api/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
    end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
    
    # Calculate cost
    lab = Lab.query.get(data['lab_id'])
    duration_hours = (end_time - start_time).total_seconds() / 3600
    cost = duration_hours * lab.hourly_rate
    
    booking = Booking(
        user_id=user_id,
        lab_id=data['lab_id'],
        start_time=start_time,
        end_time=end_time,
        purpose=data.get('purpose'),
        participants=data.get('participants', 1),
        cost=cost,
        notes=data.get('notes')
    )
    
    db.session.add(booking)
    db.session.commit()
    
    # Create budget transaction
    budget_transaction = BudgetTransaction(
        campus_id=lab.campus_id,
        booking_id=booking.id,
        transaction_type='booking',
        amount=cost,
        description=f'Lab booking: {lab.name}'
    )
    
    db.session.add(budget_transaction)
    
    # Update campus budget
    campus = Campus.query.get(lab.campus_id)
    campus.budget_used += cost
    
    db.session.commit()
    
    return jsonify({'message': 'Booking created successfully', 'id': booking.id, 'cost': cost}), 201

# Budget Management Routes
@app.route('/api/budget/summary', methods=['GET'])
@jwt_required()
def get_budget_summary():
    campus_id = request.args.get('campus_id')
    
    if campus_id:
        campus = Campus.query.get(campus_id)
        if not campus:
            return jsonify({'message': 'Campus not found'}), 404
        
        return jsonify({
            'campus_id': campus.id,
            'campus_name': campus.name,
            'budget_allocated': campus.budget_allocated,
            'budget_used': campus.budget_used,
            'budget_remaining': campus.budget_allocated - campus.budget_used
        })
    else:
        campuses = Campus.query.all()
        return jsonify([{
            'campus_id': campus.id,
            'campus_name': campus.name,
            'budget_allocated': campus.budget_allocated,
            'budget_used': campus.budget_used,
            'budget_remaining': campus.budget_allocated - campus.budget_used
        } for campus in campuses])

@app.route('/api/budget/transactions', methods=['GET'])
@jwt_required()
def get_budget_transactions():
    campus_id = request.args.get('campus_id')
    
    query = BudgetTransaction.query
    if campus_id:
        query = query.filter_by(campus_id=campus_id)
    
    transactions = query.order_by(BudgetTransaction.transaction_date.desc()).all()
    
    return jsonify([{
        'id': transaction.id,
        'campus_id': transaction.campus_id,
        'campus_name': transaction.campus.name,
        'booking_id': transaction.booking_id,
        'transaction_type': transaction.transaction_type,
        'amount': transaction.amount,
        'description': transaction.description,
        'transaction_date': transaction.transaction_date.isoformat()
    } for transaction in transactions])

# Analytics Routes
@app.route('/api/analytics/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_analytics():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Basic statistics
    total_campuses = Campus.query.count()
    total_labs = Lab.query.count()
    total_bookings = Booking.query.count()
    total_inventory_items = InventoryItem.query.count()
    
    # Recent bookings
    recent_bookings = Booking.query.order_by(Booking.created_at.desc()).limit(5).all()
    
    # Budget summary
    budget_summary = db.session.query(
        func.sum(Campus.budget_allocated).label('total_allocated'),
        func.sum(Campus.budget_used).label('total_used')
    ).first()
    
    return jsonify({
        'statistics': {
            'total_campuses': total_campuses,
            'total_labs': total_labs,
            'total_bookings': total_bookings,
            'total_inventory_items': total_inventory_items
        },
        'recent_bookings': [{
            'id': booking.id,
            'lab_name': booking.lab.name,
            'user_name': booking.user.username,
            'start_time': booking.start_time.isoformat(),
            'status': booking.status
        } for booking in recent_bookings],
        'budget_summary': {
            'total_allocated': float(budget_summary.total_allocated or 0),
            'total_used': float(budget_summary.total_used or 0)
        }
    })

# Initialize database and sample data
def init_db():
    db.create_all()
    
    # Create sample data if tables are empty
    if Campus.query.count() == 0:
        # Sample campuses
        campus1 = Campus(name='Main Campus', location='Downtown', contact_email='main@university.edu', budget_allocated=100000.0)
        campus2 = Campus(name='North Campus', location='North District', contact_email='north@university.edu', budget_allocated=75000.0)
        campus3 = Campus(name='South Campus', location='South District', contact_email='south@university.edu', budget_allocated=50000.0)
        
        db.session.add_all([campus1, campus2, campus3])
        db.session.commit()
        
        # Sample labs
        labs = [
            Lab(name='Computer Lab A', description='High-performance computing lab', capacity=30, location='Building A, Floor 2', 
                equipment_list='["30 Desktop PCs", "1 Projector", "1 Whiteboard", "Network Switch"]', hourly_rate=25.0, campus_id=1),
            Lab(name='Chemistry Lab', description='Organic chemistry laboratory', capacity=20, location='Building B, Floor 1',
                equipment_list='["20 Lab Benches", "Fume Hoods", "Chemical Storage", "Safety Equipment"]', hourly_rate=35.0, campus_id=1),
            Lab(name='Physics Lab', description='General physics experiments', capacity=25, location='Building C, Floor 3',
                equipment_list='["Oscilloscopes", "Function Generators", "Multimeters", "Lab Benches"]', hourly_rate=30.0, campus_id=2),
            Lab(name='Biology Lab', description='Microbiology and cell culture', capacity=15, location='Building D, Floor 1',
                equipment_list='["Microscopes", "Incubators", "Centrifuges", "Biosafety Cabinets"]', hourly_rate=40.0, campus_id=3)
        ]
        
        db.session.add_all(labs)
        db.session.commit()
        
        # Sample admin user
        admin_user = User(
            username='admin',
            email='admin@university.edu',
            password_hash=generate_password_hash('admin123'),
            role='admin'
        )
        
        manager_user = User(
            username='manager1',
            email='manager1@university.edu',
            password_hash=generate_password_hash('manager123'),
            role='manager',
            campus_id=1
        )
        
        regular_user = User(
            username='student1',
            email='student1@university.edu',
            password_hash=generate_password_hash('student123'),
            role='user',
            campus_id=1
        )
        
        db.session.add_all([admin_user, manager_user, regular_user])
        db.session.commit()
        
        # Sample inventory items
        inventory_items = [
            InventoryItem(name='Desktop PC', description='High-performance desktop computer', category='Computing',
                         quantity_total=30, quantity_available=28, unit_cost=800.0, supplier='TechCorp', lab_id=1),
            InventoryItem(name='Microscope', description='Digital microscope with camera', category='Optics',
                         quantity_total=10, quantity_available=9, unit_cost=1200.0, supplier='ScienceEquip', lab_id=4),
            InventoryItem(name='Oscilloscope', description='Digital storage oscilloscope', category='Electronics',
                         quantity_total=8, quantity_available=7, unit_cost=2500.0, supplier='ElectroTools', lab_id=3)
        ]
        
        db.session.add_all(inventory_items)
        db.session.commit()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)