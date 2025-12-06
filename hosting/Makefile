# provides BACKEND_PORT and DOMAIN
include ../.env
BACKEND_PORT ?= 9090

ifndef DOMAIN
$(error DOMAIN is not set. Please set DOMAIN in the environment or .env file)
endif

export DOMAIN

all:

.phony: install

clean:
	rm -rf objects
	rm -rf ../image/nginx

objects/:
	mkdir --parent objects

objects/install: host_nginx_template objects/
	sed \
	-e "s/'{DOMAIN_NAME}'/$(DOMAIN)/g" \
	-e "s;'{BACKEND_PORT}';$(BACKEND_PORT);g" \
	$< > objects/_temp_test_config && \
	cp -f objects/_temp_test_config /etc/nginx/sites-enabled/$(DOMAIN)
	nginx -t
	systemctl restart nginx
	touch $@

objects/install_ssl: objects/install
	certbot --nginx -d $(DOMAIN) --redirect
	nginx -t
	systemctl restart nginx
	touch $@

install: objects/install

install_ssl: objects/install_ssl
