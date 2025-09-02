-- Fix MariaDB Authentication for Schools Portal
-- Run these commands in MariaDB to fix authentication issues

-- Connect to MariaDB first
-- mysql -u root -p

-- Fix authentication for root user (replace 'your_password' with your actual password)
-- If you have a password, use this:
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';

-- If you want to use no password (for XAMPP/local development), use this:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify the user authentication method
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';

-- Exit
EXIT;