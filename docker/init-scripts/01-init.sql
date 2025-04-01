-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions to the test user
GRANT ALL PRIVILEGES ON DATABASE testdb TO testuser;
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO testuser; 