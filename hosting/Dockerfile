FROM python:3.13 AS base

RUN apt-get update && apt-get upgrade -y --auto-remove

RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app/backend
RUN mkdir --parent /usr/local/app/uploads

ENTRYPOINT /bin/bash

FROM base AS poetry_installed

RUN python3 -m pip install poetry poetry-plugin-export

FROM poetry_installed AS requirements_exported

COPY app/backend/pyproject.toml /usr/local/app/backend
COPY app/backend/poetry.lock /usr/local/app/backend
RUN poetry export --all-extras --without-hashes --without-urls -f requirements.txt > requirements.txt

FROM base AS app


ENTRYPOINT /bin/bash -c "uwsgi --ini /app/config/wsgi.ini"

COPY --from=requirements_exported /usr/local/app/backend/requirements.txt /usr/local/app/backend
RUN python3 -m pip install -r requirements.txt

COPY ./hosting/config/wsgi.ini /app/config/wsgi.ini
RUN mkdir --parent /var/log/image_uploads


COPY app /usr/local/app
RUN python3 -m pip install -e /usr/local/app/backend
