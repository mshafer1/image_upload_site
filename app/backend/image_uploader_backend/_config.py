import decouple as _decouple

secret_key: str = _decouple.config("SECRET_KEY")
"""Key used to base cookies and other security items off of."""
