const shell = require('shelljs');
const inquirer = require('inquirer');

// Pertanyaan untuk pengguna
const questions = [
  {
    type: 'confirm',
    name: 'update',
    message: 'Apakah Anda ingin memperbarui sistem terlebih dahulu?',
    default: true,
  },
  {
    type: 'input',
    name: 'domain',
    message: 'Masukkan domain/subdomain Anda untuk Pterodactyl Panel:',
  },
  {
    type: 'input',
    name: 'email',
    message: 'Masukkan email Anda untuk SSL:',
  },
];

inquirer.prompt(questions).then((answers) => {
  if (answers.update) {
    console.log('Memperbarui sistem...');
    shell.exec('apt update && apt upgrade -y');
  }

  console.log('Menginstal dependensi...');
  shell.exec('apt install -y software-properties-common curl apt-transport-https');

  console.log('Menambahkan repositori PHP...');
  shell.exec('add-apt-repository -y ppa:ondrej/php');

  console.log('Menginstal PHP dan dependensi...');
  shell.exec('apt install -y php8.1 php8.1-fpm php8.1-cli php8.1-mysql php8.1-zip php8.1-xml php8.1-bcmath php8.1-mbstring unzip nginx mysql-server');

  console.log('Mengunduh Pterodactyl Panel...');
  shell.exec('curl -Lo panel.tar.gz https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz');
  shell.exec('mkdir -p /var/www/pterodactyl && tar -xzvf panel.tar.gz -C /var/www/pterodactyl && rm panel.tar.gz');

  console.log('Menginstal Composer...');
  shell.exec('curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer');

  console.log('Mengatur izin file...');
  shell.exec('chown -R www-data:www-data /var/www/pterodactyl');
  shell.exec('chmod -R 755 /var/www/pterodactyl');

  console.log('Mengatur database...');
  shell.exec("mysql -e \"CREATE DATABASE panel;\"");
  shell.exec("mysql -e \"CREATE USER 'pterodactyl'@'localhost' IDENTIFIED BY 'password';\"");
  shell.exec("mysql -e \"GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'localhost'; FLUSH PRIVILEGES;\"");

  console.log('Mengatur lingkungan Pterodactyl...');
  shell.exec('cd /var/www/pterodactyl && cp .env.example .env && composer install --no-dev --optimize-autoloader');

  console.log('Mengatur SSL...');
  shell.exec(`apt install -y certbot python3-certbot-nginx && certbot --nginx -d ${answers.domain} --email ${answers.email} --agree-tos --non-interactive`);

  console.log('Konfigurasi selesai. Silakan lanjutkan dengan setup manual jika diperlukan.');
});


      
