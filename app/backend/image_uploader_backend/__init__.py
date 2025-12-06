import imghdr
import logging
import pathlib

import flask
import werkzeug
import decouple
import werkzeug.utils

_logger = logging.getLogger(__name__)
_module_dir = pathlib.Path(__file__).parent.resolve()
_frontend_dir = _module_dir / "../../frontend"
_upload_dir: pathlib.Path = decouple.config("UPLOAD_DIR", default=str(_module_dir / "uploads"), cast=pathlib.Path)
_upload_dir.mkdir(parents=True, exist_ok=True)

_ALLOWED_EXTENSIONS = {"jpg", "png", "bmp", "jpeg"}
app = flask.Flask("image_uploader_backend", static_folder=_frontend_dir/"static")
app.config["UPLOAD_FOLDER"] = str(_upload_dir)
app.config["UPLOAD_EXTENSIONS"] = [f".{ext}" for ext in _ALLOWED_EXTENSIONS]
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024  # 25 MiB

@app.route("/", methods=["GET", "POST"])
def index():
    if flask.request.method == "GET":
        return flask.send_file(_frontend_dir / "index.html")
    else:
        files = flask.request.files.getlist("pic")
        _logger.info("Recieved %d files from %s", len(files), flask.request.remote_addr)
        if len(files) == 0:
            raise flask.abort(400, "No file uploaded")
        for pic in files:
            if not pic:
                raise flask.abort(400, "No file uploaded")
            
            filename = werkzeug.utils.secure_filename(pic.filename)
            if not filename:
                raise flask.abort(400, "No file uploaded")
            
            _handle_file_upload(pic, filename)
        return flask.Response("File uploaded successfully", status=200)

def _handle_file_upload(pic, filename):
    file_extension = _validate_image(pic.stream)
    filename_ext = pathlib.Path(filename).suffix.lower().lstrip(".")
    _logger.info("Received:", filename, "detected ext:", file_extension)
    file_exensions_are_both_jpge = file_extension in {"jpg", "jpeg"} and filename_ext in {"jpg", "jpeg"}
    if (file_extension != filename_ext and not file_exensions_are_both_jpge) or filename_ext not in _ALLOWED_EXTENSIONS:
        _logger.warning("Rejecting %s due to mismatched extension: %s != %s", filename, file_extension, filename_ext)
        raise flask.abort(400, "Invalid image")
        
    pic.save(_upload_dir / filename)

def _validate_image(stream):
    header = stream.read(512)
    stream.seek(0)
    img_format = imghdr.what(None, header)
    return img_format
