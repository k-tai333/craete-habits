# PHP 8.4 + Laravel用Dockerfile
FROM php:8.4-fpm

# システムパッケージの更新と必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    supervisor \
    nginx \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composerのインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 作業ディレクトリの設定
WORKDIR /var/www/html

# PHP設定ファイルのコピー
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

# Nginx設定ファイルのコピー
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Supervisor設定ファイルのコピー
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# アプリケーションファイルのコピー
COPY . /var/www/html

# 権限の設定
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# 依存関係のインストール
RUN composer install --no-dev --optimize-autoloader --no-interaction

# 環境変数の設定
ENV APP_ENV=production
ENV APP_DEBUG=false

# ポートの公開
EXPOSE 80

# Supervisorを使用してNginxとPHP-FPMを起動
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
