-- Run as the migration owner, after creating a separate login role named portal_runtime.
-- Set its password out of band through your database/secrets tooling.
GRANT USAGE ON SCHEMA public TO portal_runtime;
GRANT SELECT ON portal_users TO portal_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions, login_transactions, rate_limits TO portal_runtime;
GRANT SELECT, INSERT, UPDATE ON user_preferences TO portal_runtime;
GRANT SELECT, INSERT ON audit_events TO portal_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO portal_runtime;
-- No user-management, schema DDL, or audit update/delete rights for the web process.
