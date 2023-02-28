# following this as a guide 
# https://dev.to/nagatodev/how-to-add-login-authentication-to-a-flask-and-react-application-23i7
from flask import Flask, request, jsonify, json, abort
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
from models import db, Employees, Customers, Generators, ServiceRecords



api = Flask(__name__)
api.config.from_object(ApplicationConfig)
CORS(api)
bcrypt = Bcrypt(api)
db.init_app(api)


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
    
   #if email != "test" or password != "test":
   #    return {"msg": "Wrong email or password"}, 401

    user = Employees.query.filter_by(Email=email).first()
    
    if user is None:
        return {"msg": "Wrong email or password"}, 401
    
    if not bcrypt.check_password_hash(user.Password, password):
        return {"msg": "Wrong email or password"}, 401

    access_token = create_access_token(identity=email)
    response = {"access_token":access_token}
    return response


#The log out route
@api.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


# this function should return an array of employee objects with: 
# firstName, lastName, employeeID, and their username and password
@api.route("/employees", methods=["GET"])
def team():
    
    #tst = User("Harry", "Balsagna", 69, "tmp", "tmp", False)

    team_list = []
    team_size = Employees.query.count()
    for i in Employees.query.all():
        employee = {
            "fN" : i.FirstName,
            "lN" : i.LastName,
            "id" : i.Employeeid,
            "phone" : 1234567891, # must be 10 digits
            "hiredDate" : "2/26/2023",
        }
        team_list.append(employee)
    return team_list
    
    
    
    
    get_employees = jsonify({"John Appleseed"})
    return get_employees

@api.route("/profile", methods=["GET"])
@jwt_required()
# this protects the endpoint (user must have a token)
def my_profile():
    response_body = {
        "firstName": "Michael",
        "lastName": "Parascandolo",
        "Admin": True,
    }

    return response_body

#Creating employees route
@api.route("/employees/create", methods=["POST"])
@jwt_required()
def create_employee():
    id1 = request.json["EmployeeID"]
    email1 = request.json["Email"]
    password1 = request.json["Password"]
    firstname1 = request.json["First Name"]
    lastname1 = request.json["Last Name"]
    datehired1 = request.json["Date Hired"]
    admin1 = request.json["Admin"]

    employee_exists = Employees.query.filter_by(Employeeid = id1).first() is not None

    if employee_exists:
        abort(409)

    hashed_password = bcrypt.generate_password_hash(password1)
    new_employee = Employees(Employeeid = id1, Email = email1, Password = hashed_password, FirstName = firstname1, LastName = lastname1, DateHired = datehired1, Admin = admin1)
    db.session.add(new_employee)
    db.session.commit()

    return jsonify({
        "ID": new_employee.Employeeid,
        "Email": new_employee.Email,
        "First Name": new_employee.FirstName,
        "Last Name": new_employee.LastName
        })

@api.route("/customer/create", methods=["POST"])
@jwt_required()
def create_customer():
    id1 = request.json["CustomerID"]
    firstname1 = request.json["First Name"]
    lastname1 = request.json["Last Name"]
    email1 = request.json["Email"]
    city1 = request.json["City"]
    street1 = request.json["Street"]
    phonenumber1 = request.json["Phone Number"]
    
    customer_exists = Customers.query.filter_by(Customerid = id1).first() is not None

    if customer_exists:
        abort(409)

    new_customer = Customers(id = id, firstname = firstname1, lastname = lastname1, email = email1, city = city1, street = street1, phonenumber = phonenumber1)
    db.session.add(new_customer)
    db.session.commit()

    return jsonify({
        "ID": new_customer.Customerid,
        "First Name": new_customer.FirstName,
        "Last Name": new_customer.LastName,
        "Email": new_customer.Email,
        "City": new_customer.City,
        "Street": new_customer.Street,
        "Phone Number": new_customer.PhoneNumber
        })

#Creating generator route
@api.route("/generator/create", methods=["POST"])
@jwt_required()
def create_generator():
    id1 = request.json["CustomerID"]
    name1 = request.json["Name"]
    cost1 = request.json["Price"]
    notes1 = request.json["Notes"]
    
    generator_exists = Generators.query.filter_by(Generatorid = id1).first() is not None

    if generator_exists:
        abort(409)

    new_generator = Generators(Generatorid = id1, Name = name1, Cost = cost1, Notes = notes1)
    db.session.add(new_generator)
    db.session.commit()

    return jsonify({
        "ID": new_generator.Generatorid,
        "Name": new_generator.Name,
        "Cost": new_generator.Cost,
        "Notes": new_generator.Notes
        })

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