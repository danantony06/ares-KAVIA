from flask import Flask, redirect, url_for
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", default="006363ce276b892f9f89d16571fd0113")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", default="sqlite:///db.sqlite3")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["PROPAGATE_EXCEPTIONS"] = True

    db.init_app(app)

    from .auth import auth
    from .views import views

    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(views, url_prefix="/")

    with app.app_context():
        db.create_all()

    login_manager = LoginManager()
    login_manager.login_view = "auth.signin"
    login_manager.login_message = ""
    login_manager.init_app(app)

    from .models import User

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return redirect(url_for("auth.signin"))

    return app
