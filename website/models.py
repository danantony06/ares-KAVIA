from . import db
from flask_login import UserMixin
from datetime import datetime

class User(db.Model, UserMixin):
    """User account for authentication and association with workouts and progress."""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(200))
    workouts = db.relationship("Workout", backref="user", cascade="all, delete-orphan", lazy=True)
    # Link to per-exercise progress logs
    exercise_logs = db.relationship("ExerciseLog", backref="user", cascade="all, delete-orphan", lazy=True)

class Workout(db.Model):
    """A Workout, owned by a user, comprised of Exercises."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(12))
    description = db.Column(db.String(18))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    exercises = db.relationship("Exercise", backref="workout", cascade="all, delete-orphan", lazy=True)
    # Link to exercise logs performed in this workout
    exercise_logs = db.relationship("ExerciseLog", backref="workout", cascade="all, delete-orphan", lazy=True)

class Exercise(db.Model):
    """Exercise definition as part of a workout."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(45))
    weight = db.Column(db.Float)          # (Template for default/previous value, deprecated for logs)
    details = db.Column(db.String(120))   # (e.g. machine, variation, etc.)
    include_details = db.Column(db.Boolean)
    workout_id = db.Column(db.Integer, db.ForeignKey("workout.id"), nullable=False)
    # Relationship to progress records
    exercise_logs = db.relationship("ExerciseLog", backref="exercise", cascade="all, delete-orphan", lazy=True)

# PUBLIC_INTERFACE
class ExerciseLog(db.Model):
    """
    Stores a user's historical progress for a specific exercise (weight and reps) within a workout session/date.

    Fields:
        - id: Primary Key
        - exercise_id: Exercise reference (FK)
        - user_id: User reference (FK)
        - workout_id: Workout reference (FK)
        - timestamp: Date and time of the set/log entry (indexed for trending)
        - weight: Weight used in this log (float, required)
        - reps: Number of reps performed (required)
        - details: Optional details string for session (notes, settings, etc.)
    Relationships:
        - user: Parent User
        - workout: Parent Workout (if relevant to a session)
        - exercise: Parent Exercise
    """
    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercise.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    workout_id = db.Column(db.Integer, db.ForeignKey("workout.id"), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    weight = db.Column(db.Float, nullable=False)  # Weight used in this set/session
    reps = db.Column(db.Integer, nullable=False)  # Reps for this set/session
    details = db.Column(db.String(255))           # Optional: session notes, machine settings, etc.

    def __repr__(self):
        return f"<ExerciseLog user={self.user_id} ex={self.exercise_id} wt={self.weight} reps={self.reps} ts={self.timestamp}>"
