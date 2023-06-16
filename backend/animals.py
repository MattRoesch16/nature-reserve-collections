from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from uuid import uuid4

db = SQLAlchemy()

class Animals(db.Model):
    __tablename__ = "ANIMAL"
    Animalid = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
    CommonName = db.Column(db.String(100), unique=True, nullable=False)
    SpeciesName = db.Column(db.String(100), unique=True, nullable=False)
    Image = db.Column(db.Text, unique=True, nullable=False)
    Type = db.Column(db.String(50), unique=False, nullable=False)
    Description = db.Column(db.Text, unique=False, nullable=False)

class Tags(db.Model):
    __tablename__ = "TAG"
    Tagid = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
    TagName = db.Column(db.String(20), unique=True, nullable=False)

class MyPictures(db.Model):
    __tablename__ = "MYPICTURE"
    Pictureid = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
    DateTaken = db.Column(db.String(10), unique=False, nullable=False)
    Notes = db.Column(db.Text, unique=False, nullable=True)

class Animal_Identifiers(db.Model):
    __tablename__ = "ANIMAL_IDENTIFIER"
    Animalid = db.Column(db.Integer, db.ForeignKey('ANIMAL.Animalid'), primary_key=True, nullable=False)
    IntAnimal = db.relationship("Animals", backref=db.backref("ANIMAL", uselist=False))
    Tagid = db.Column(db.Integer, primary_key=True, nullable=False)
    IntTag = db.relationship("Tags", backref=db.backref("TAG", uselist=False))

class Animal_Pictures(db.Model):
    __tablename__ = "ANIMAL_PICTURE"
    Animalid = db.Column(db.Integer, db.ForeignKey('ANIMAL.Animalid'), primary_key=True, nullable=False)
    IntAnimal = db.relationship("Animals", backref=db.backref("ANIMAL", uselist=False))
    Pictureid = db.Column(db.Integer, db.ForeignKey('MYPICTURE.Pictureid'), primary_key=True, nullable=False)
    IntPicture = db.relationship("MyPictures", backref=db.backref("MYPICTURE", uselist=False))

