from flask import Blueprint, render_template


main_bp = Blueprint("main", __name__)


# Placeholder in-memory data for initial GUI scaffolding
labs = [
    {"id": 1, "name": "Chemistry Lab A", "location": "Bldg 2, Room 210", "capacity": 24},
    {"id": 2, "name": "Physics Lab B", "location": "Bldg 3, Room 105", "capacity": 18},
]

equipment = [
    {"id": 1, "name": "Oscilloscope", "lab": "Physics Lab B", "status": "Available"},
    {"id": 2, "name": "Centrifuge", "lab": "Chemistry Lab A", "status": "In Use"},
]

bookings = [
    {"id": 1, "lab": "Chemistry Lab A", "date": "2025-10-01", "time": "10:00-12:00", "by": "Dr. Smith"},
    {"id": 2, "lab": "Physics Lab B", "date": "2025-10-02", "time": "13:00-15:00", "by": "Prof. Lee"},
]

users = [
    {"id": 1, "name": "Dr. Alice Smith", "role": "Faculty", "email": "alice@university.edu"},
    {"id": 2, "name": "Bob Johnson", "role": "Technician", "email": "bob@university.edu"},
]

safety = [
    {"id": 1, "item": "MSDS Binder", "lab": "Chemistry Lab A", "status": "Complete"},
    {"id": 2, "item": "Eye Wash Station", "lab": "Physics Lab B", "status": "Inspection Due"},
]

inventory = [
    {"id": 1, "item": "Ethanol (1L)", "quantity": 5, "lab": "Chemistry Lab A"},
    {"id": 2, "item": "Resistors Pack", "quantity": 20, "lab": "Physics Lab B"},
]

maintenance = [
    {"id": 1, "equipment": "Centrifuge", "issue": "Noise at high RPM", "status": "Open"},
]

reports = [
    {"id": 1, "title": "Monthly Usage", "period": "Sep 2025", "generated_by": "System"},
]


@main_bp.route("/")
def index():
    return render_template(
        "index.html",
        stats={
            "labs": len(labs),
            "equipment": len(equipment),
            "bookings": len(bookings),
            "users": len(users),
        },
        bookings=bookings,
        maintenance=maintenance,
    )


@main_bp.route("/labs")
def labs_page():
    return render_template("labs.html", labs=labs)


@main_bp.route("/equipment")
def equipment_page():
    return render_template("equipment.html", equipment=equipment)


@main_bp.route("/bookings")
def bookings_page():
    return render_template("bookings.html", bookings=bookings)


@main_bp.route("/users")
def users_page():
    return render_template("users.html", users=users)


@main_bp.route("/safety")
def safety_page():
    return render_template("safety.html", safety=safety)


@main_bp.route("/inventory")
def inventory_page():
    return render_template("inventory.html", inventory=inventory)


@main_bp.route("/maintenance")
def maintenance_page():
    return render_template("maintenance.html", maintenance=maintenance)


@main_bp.route("/reports")
def reports_page():
    return render_template("reports.html", reports=reports)

