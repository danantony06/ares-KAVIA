from . import db
from .models import User
from faker import Faker
from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_user, login_required, logout_user
from werkzeug.security import generate_password_hash, check_password_hash

# Define blueprint
auth = Blueprint("auth", __name__)


@auth.route("/signin", methods=["GET", "POST"])
def signin():
    if request.method == "POST":
        # Check if user logged in with demo user
        if "demo_user" in request.form:
            fake = Faker()

            # Generate random user info
            email = fake.email()
            password = fake.password()

            # Register demo user
            demo_user = User(email=email, password=generate_password_hash(password, method="pbkdf2:sha256"))
            db.session.add(demo_user)
            db.session.commit()

            # Log user in
            login_user(demo_user, remember=False)

            # Redirect user to home page
            return redirect(url_for("views.home"))
        else:
            # Collect form information
            email = request.form.get("email")
            password = request.form.get("password")

            # Query database for user
            user = User.query.filter_by(email=email).first()

            # Ensure email was submitted
            if not email:
                flash("Must provide an email address.", category="error")

            # Ensure password was submitted
            elif not password:
                flash("Must provide a password.", category="error")

            # Ensure email is in database
            elif user:
                # Ensure password matches
                if check_password_hash(user.password, password):
                    # Log user in
                    login_user(user, remember=True)
                    return redirect(url_for("views.home"))

                else:
                    flash("Incorrect password. Try again.", category="error")

            else:
                flash("Email does not exist.", category="error")

    # Display form to user
    return render_template("signin.html")


@auth.route("/logout")
@login_required
def logout():
    # Log user out
    logout_user()

    # Redirect user to sign-in page
    return redirect(url_for("auth.signin"))


@auth.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        # Collect form information
        email = request.form.get("email")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        # Query database for user
        user = User.query.filter_by(email=email).first()

        # Ensure email was submitted
        if not email:
            flash("Must provide an email address.", category="error")

        # Ensure email doesn't already exist
        elif user:
            flash("Email already exists.", category="error")

        # Ensure password was submitted
        elif not password:
            flash("Must provide a password.", category="error")

        # Ensure password contains at least 8 characters
        elif len(password) < 8:
            flash("Password must cointain at least 8 characters.", category="error")

        # Ensure confirmation was submitted
        elif not confirmation:
            flash("Must confirm the password", category="error")

        # Ensure password and confirmation match
        elif password != confirmation:
            flash("Passwords don't match.", category="error")

        # Add user to database
        else:
            new_user = User(email=email, password=generate_password_hash(password, method="pbkdf2:sha256"))
            db.session.add(new_user)
            db.session.commit()

            # Log user in
            login_user(new_user, remember=True)

            # Redirect user to home page
            return redirect(url_for("views.home"))

    # Display form to user
    return render_template("signup.html")
