SELECT u.id, u.email, u.role, u."isActive", u."createdAt", COUNT(a.id) as account_count 
FROM "User" u 
LEFT JOIN "Account" a ON u.id = a."userId" 
WHERE u.email = 'chandan.sweyainfo@gmail.com' 
GROUP BY u.id, u.email, u.role, u."isActive", u."createdAt";

SELECT a.id, a."userId", a.provider, a."providerAccountId", a."type"
FROM "Account" a
WHERE a.provider = 'google';
