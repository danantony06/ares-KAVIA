from . import db
from flask_login import UserMixin


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(200))
    workouts = db.relationship("Workout")


class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(12))
    description = db.Column(db.String(18))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    exercises = db.relationship("Exercise")


class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(45))
    weight = db.Column(db.Float(5))
    details = db.Column(db.String(5))
    include_details = db.Column(db.Boolean)
    workout_id = db.Column(db.Integer, db.ForeignKey("workout.id"))
    # Relationship to log entries
    exercise_logs = db.relationship("ExerciseLog", backref="exercise", lazy=True)


# PUBLIC_INTERFACE
class ExerciseLog(db.Model):
    """
    Represents a historical record of an exercise performed as part of a workout.
    Used for tracking user progress over time.
    """
    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercise.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    workout_id = db.Column(db.Integer, db.ForeignKey("workout.id"), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    weight = db.Column(db.Float(5))  # Weight used in this session, optional
    details = db.Column(db.String(5))  # Details for this exercise session, optional

    # Relationship: link back to User and Workout for history queries
    user = db.relationship("User", backref="exercise_logs", lazy=True)
    workout = db.relationship("Workout", backref="exercise_logs", lazy=True)
