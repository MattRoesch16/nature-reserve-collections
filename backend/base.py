# following this as a guide 
# https://dev.to/nagatodev/how-to-add-login-authentication-to-a-flask-and-react-application-23i7
from flask import Flask, request, jsonify, json, abort
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from sqlalchemy import or_
from flask_cors import CORS, cross_origin
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
from models import db, Employees, Customers, Generators, ServiceRecords, Service_Employee_Int
import csv



api = Flask(__name__)
CORS(api)
api.config['CORS_HEADERS'] = 'Content-Type'
api.config.from_object(ApplicationConfig)
bcrypt = Bcrypt(api)
db.init_app(api)

with api.app_context():
    db.create_all()
    file_path = 'testFile.csv' # Actual File Path goes here
    file = open(file_path)
    reader = csv.reader(file)
    header = next(reader)  # Pulls the first row of the csv file

    for row in reader:
        if Generators.query.filter_by(Generatorid = row[1]).first() is None: # Loads every row into a big array full of arrays
            new_generator = Generators(Generatorid = row[1], Name = row[0], Cost = row[2], Notes = row[3])
            db.session.add(new_generator)
            db.session.commit()
    file.close()

api.config["JWT_SECRET_KEY"] = "aosdflnasldfnaslndflnsdnlnlknlkgtudsrtstr"
api.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(api)

@api.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original response
        return response


#The login route
@api.route('/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    
    user = Employees.query.filter_by(Email=email).first()
    
    if user is None:
        return {"msg": "User Not Found"}, 401
    
    if not bcrypt.check_password_hash(user.Password, password):
        return {"msg": "Invalid Password"}, 401

    access_token = create_access_token(identity=email)
    response = {"access_token":access_token}

    return response


#The log out route
@api.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "Logout Successful"})
    unset_jwt_cookies(response)
    return response


# this function should return an array of employee objects with: 
# firstName, lastName, employeeID, and their username and password
@api.route('/employees', methods=["GET"])
@jwt_required()
def team():
    
    team_list = []
    for i in Employees.query.all():
        employee = {
            "fN" : i.FirstName,
            "lN" : i.LastName,
            "id" : i.Employeeid,
            "admin": i.Admin,
            "email": i.Email,
            "phone" : i.PhoneNumber,
            "hiredDate" : i.DateHired,
        }
        team_list.append(employee)
    return team_list
    
#returns the currently logged in user's firstname and permission level
@api.route("/profile", methods=["GET"])
@jwt_required()
def my_profile():
    user = Employees.query.filter_by(Email=get_jwt_identity()).first()
    response_body = {
        "firstName": user.FirstName,
        "Admin": user.Admin,
        "ID": user.Employeeid,
    }

    return response_body

#Creating employees route
@api.route("/employees/create", methods=["POST"])
@cross_origin()
@jwt_required()
def create_employee():
    id1 = request.json["EmployeeID"]
    email1 = request.json["Email"]
    password1 = request.json["Password"]
    firstname1 = request.json["First Name"]
    lastname1 = request.json["Last Name"]
    phonenumber1 = request.json["Phone Number"]
    admin1 = request.json["Admin"]
    dateHired = request.json["hiredDate"]

    employee_exists = Employees.query.filter_by(Employeeid = id1).first() is not None

    if employee_exists:
        abort(409)

    hashed_password = bcrypt.generate_password_hash(password1)
    new_employee = Employees(Employeeid = id1, Email = email1, Password = hashed_password, FirstName = firstname1, LastName = lastname1, PhoneNumber = phonenumber1, Admin = admin1, DateHired = dateHired)
    db.session.add(new_employee)
    db.session.commit()

    return jsonify({
        "ID": new_employee.Employeeid,
        "Email": new_employee.Email,
        "First Name": new_employee.FirstName,
        "Last Name": new_employee.LastName
        })

#Deleting employees route
@api.route("/employees/delete", methods=["POST"])
@cross_origin()
@jwt_required()
def delete_employee():
    reqs = request.get_json()
    id1 = reqs.get("EmployeeID")

    employee_exists = Employees.query.filter_by(Employeeid = id1).first() is not None

    if not employee_exists:
        abort(409)
        
    Employees.query.filter_by(Employeeid = id1).delete()
    db.session.commit()
    
    return jsonify({"ID": id1})


#Changes user between admin/user
@api.route("/employees/permission", methods=["POST"])
@cross_origin()
@jwt_required()
def change_permission():
    empID = request.json.get("EmployeeID", None)

    user = Employees.query.filter_by(Employeeid = empID).first()

    if user is None:
        abort(409)
        
    user.Admin = not user.Admin
    db.session.commit()
    
    return jsonify({"Permission changed for ID": empID})
    

#Search and Display Customers    
@api.route("/customer/display", methods=["POST"])
@cross_origin()
@jwt_required()
def display_customers():

    reqs = request.get_json()
    searchTerm = reqs.get("Search")
    customer_list = []
    for i in Customers.query.filter(or_(Customers.FirstName.like('%' + searchTerm + '%'),
                                        Customers.LastName.like('%' + searchTerm + '%'))):
        customer = {
            "ID": i.Customerid,
            "FirstName": i.FirstName,
            "LastName": i.LastName,
            "Email": i.Email,
            "Phone": i.PhoneNumber,
            "City": i.City,
            "Street": i.Street,
            "State": i.State,
            "ZIP": i.ZIP
        }
        customer_list.append(customer)
    return customer_list


#Shows all of a single customer's details
@api.route("/customer/details", methods=["POST"])
@cross_origin()
@jwt_required()
def customer_details():
    reqs = request.get_json()
    id1 = reqs.get("clientID")

    i = Customers.query.filter_by(Customerid = id1).first()

    customer = {
            "ID": i.Customerid,
            "FirstName": i.FirstName,
            "LastName": i.LastName,
            "Email": i.Email,
            "Phone": i.PhoneNumber,
            "City": i.City,
            "Street": i.Street,
            "State": i.State,
            "ZIP": i.ZIP
        }

    return customer



#Creating Customers
@api.route('/customer/create', methods=["POST"])
@cross_origin()
@jwt_required()
def create_customer():
    id1 = request.json["CustomerID"]
    firstname1 = request.json["First Name"]
    lastname1 = request.json["Last Name"]
    email1 = request.json["Email"]
    city1 = request.json["City"]
    street1 = request.json["Street"]
    phonenumber1 = request.json["Phone Number"]
    state1 = request.json["State"]
    Zip1 = request.json["ZIP Code"]
    
    customer_exists = Customers.query.filter_by(Customerid = id1).first() is not None

    if customer_exists:
        abort(409)

    new_customer = Customers(Customerid = id1, FirstName = firstname1, LastName = lastname1, Email = email1, City = city1, Street = street1, PhoneNumber = phonenumber1, State = state1, ZIP = Zip1)
    db.session.add(new_customer)
    db.session.commit()

    return jsonify({
        "ID": new_customer.Customerid,
        "First Name": new_customer.FirstName,
        "Last Name": new_customer.LastName,
        "Email": new_customer.Email,
        "City": new_customer.City,
        "Street": new_customer.Street,
        "State": new_customer.State,
        "ZIP": new_customer.ZIP,
        "Phone Number": new_customer.PhoneNumber
        })

#Deleting Customers
@api.route("/customer/delete", methods=["POST"])
@cross_origin()
@jwt_required()
def delete_customer():
    reqs = request.get_json()
    id1 = reqs.get("CustomerID")

    customer_exists = Customers.query.filter_by(Customerid = id1).first() is not None

    if not customer_exists:
        abort(409)

    Customers.query.filter_by(Customerid = id1).delete()
    db.session.commit()

    return jsonify({"ID": id1})


#Should be able to delete all of this route. Just not doing it yet until cleared with team
#Creating generator route
@api.route("/generator/create", methods=["POST"])
@jwt_required()
def create_generator():
    id1 = request.json["GeneratorID"]
    name1 = request.json["Name"]
    cost1 = request.json["Price"]
    notes1 = request.json["Notes"]
    
    generator_exists = Generators.query.filter_by(Generatorid = id1).first() is not None

    if generator_exists:
       return {"msg": "Generator already exists"}, 401

    new_generator = Generators(Generatorid = id1, Name = name1, Cost = cost1, Notes = notes1)
    db.session.add(new_generator)
    db.session.commit()

    return {"msg": "Generator added"}, 401



#Creates a new service record in the database, checks for errors while creating
@api.route("/service/create", methods=["POST"])
@jwt_required()
def create_service():
    id1 = request.json["ServiceID"]
    customerid1 = request.json["CustomerID"]
    employeeid1 = request.json["EmployeeID"]
    generatorid1 = request.json["GeneratorID"]
    performed1 = request.json["Service Performed"]
    date1 = request.json["Date Performed"]
    notes1 = request.json["Notes"]
    
    service_exists = ServiceRecords.query.filter_by(Serviceid = id1).first() is not None

    if service_exists:
        abort(409)

    new_service = ServiceRecords(Serviceid = id1, Customerid = customerid1, Employeeid = employeeid1, Generatorid = generatorid1, ServicePerformed = performed1, DatePerformed = date1, Notes = notes1)
    db.session.add(new_service)
    db.session.commit()

    return jsonify({
        "ID": new_service.Serviceid,
        "Customer Name": new_service.Customerid,
        "Employee Name": new_service.Employeeid,
        "Generator Type": new_service.Generatorid,
        "Service Performed": new_service.ServicePerformed,
        "Date Performed": new_service.DatePerformed,
        "Notes": new_service.Notes
        })

@api.route("/generators/details", methods=["GET"])
@jwt_required()
def retrieve_generators():
    gList = []
    for g in Generators.query.all():
        generator =  {
            "gID" : g.Generatorid,
            "gName" : g.Name,
            "gCost" : g.Cost,
            "gNotes" : g.Notes
        }
        gList.append(generator)

    return gList

@api.route("/service/details", methods=["POST"])
@jwt_required()
def retrieve_services():
    reqs = request.get_json()
    id1 = reqs.get("CustomerID")
    services = []

    for i in ServiceRecords.query.filter_by(Customerid = id1).all():
        services.append({
            "notes": i.Notes
        })

    return services