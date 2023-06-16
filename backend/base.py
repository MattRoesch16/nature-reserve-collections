# following this as a guide 
# https://dev.to/nagatodev/how-to-add-login-authentication-to-a-flask-and-react-application-23i7
from flask import Flask, request, jsonify, json, abort
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from sqlalchemy import or_, and_
from flask_cors import CORS, cross_origin
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
from models import db, Users, Locations, Animals, Animal_Pictures, Animal_Identifiers, MyPictures, Tags
import csv, secrets, string, random



api = Flask(__name__)
CORS(api)
api.config['CORS_HEADERS'] = 'Content-Type'
api.config.from_object(ApplicationConfig)
bcrypt = Bcrypt(api)
db.init_app(api)

with api.app_context():
    db.create_all()

api.config["JWT_SECRET_KEY"] = "aosdflnasldfnaslndflnsdnlnlknlkgtudsrtstr"
jwt = JWTManager(api)

# we might not need this code anymore
# api.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
# @api.after_request
# def refresh_expiring_jwts(response):
#     try:
#         exp_timestamp = get_jwt()["exp"]
#         now = datetime.now(timezone.utc)
#         target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
#         if target_timestamp > exp_timestamp:
#             access_token = create_access_token(identity=get_jwt_identity())
#             data = response.get_json()
#             if type(data) is dict:
#                 data["access_token"] = access_token 
#                 response.data = json.dumps(data)
#         return response
#     except (RuntimeError, KeyError):
#         # Case where there is not a valid JWT. Just return the original response
#         return response


#The login route
@api.route('/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    remember = request.json.get("remember", None)
    
    user = Users.query.filter_by(Email=email).first()
    access_token = create_access_token(identity=email)
    if user is None:
        return {"msg": "User Not Found"}, 401
    
    if not bcrypt.check_password_hash(user.Password, password):
        return {"msg": "Invalid Password"}, 401

    if remember:
        expires_delta = timedelta(days=7)
    else:
        expires_delta = timedelta(minutes=30)

    access_token = create_access_token(identity=email,expires_delta=expires_delta)
    response = {"access_token":access_token}

    return response

#The Sign Up route
@api.route('/signup', methods=["POST"])
def signup():
    username = request.json.get("username", None)
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    remember = request.json.get("remember", None)

    user_exists = Users.query.filter_by(Email = email).first() is not None

    if user_exists:
        abort(409)

    hashed_password = bcrypt.generate_password_hash(password)
    new_user = Users(UserName = username, Email = email, Password = hashed_password)
    db.session.add(new_user)
    db.session.commit()

    user = Users.query.filter_by(Email=email).first()
    access_token = create_access_token(identity=email)
    if user is None:
        return {"msg": "User Not Found"}, 401
    
    if not bcrypt.check_password_hash(user.Password, password):
        return {"msg": "Invalid Password"}, 401

    if remember:
        expires_delta = timedelta(days=7)
    else:
        expires_delta = timedelta(minutes=30)

    access_token = create_access_token(identity=email,expires_delta=expires_delta)
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
    for i in Users.query.all():
        employee = {
            "fN" : i.FirstName,
            "lN" : i.LastName,
            "id" : i.Employeeid,
            "email": i.Email,
            "phone" : i.PhoneNumber,
        }
        team_list.append(employee)
    return team_list

#returns the currently logged in user's firstname and permission level
@api.route("/profile", methods=["GET"])
@jwt_required()
def my_profile():
    user = Users.query.filter_by(Email=get_jwt_identity()).first()
    response_body = {
        "firstName": user.UserName,
        "ID": user.Userid
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

    employee_exists = Users.query.filter_by(Userid = id1).first() is not None

    if employee_exists:
        abort(409)

    hashed_password = bcrypt.generate_password_hash(password1)
    new_employee = Users(Userid = id1, Email = email1, Password = hashed_password, FirstName = firstname1, LastName = lastname1, PhoneNumber = phonenumber1)
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
    # only an admin can delete employees
    user = Users.query.filter_by(Email=get_jwt_identity()).first()
    if user.Admin == True:
        reqs = request.get_json()
        id1 = reqs.get("EmployeeID")

        employee_exists = Users.query.filter_by(Userid = id1).first() is not None

        if not employee_exists:
            abort(409)
            
        Users.query.filter_by(Userid = id1).delete()
        db.session.commit()
        
        return jsonify({"ID": id1})


#Changes user between admin/user
@api.route("/employees/permission", methods=["POST"])
@cross_origin()
@jwt_required()
def change_permission():
    empID = request.json.get("EmployeeID", None)

    user = Users.query.filter_by(Userid = empID).first()

    if user is None:
        abort(409)
        
    user.Admin = not user.Admin
    db.session.commit()
    
    return jsonify({"Permission changed for ID": empID})
