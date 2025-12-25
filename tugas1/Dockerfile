FROM php:8.4-cli-alpine
WORKDIR /app
RUN apk add --no-cache bash sqlite sqlite-dev libzip-dev oniguruma-dev icu-dev zlib-dev curl git unzip
RUN docker-php-ext-install pdo pdo_sqlite zip intl
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY . /app

RUN composer install --no-interaction --prefer-dist --optimize-autoloader

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
	&& chown -R www-data:www-data /app/storage /app/bootstrap/cache /app/database

USER www-data
EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
