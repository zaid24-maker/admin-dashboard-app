const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // 1. Check if the user sent an Authorization header that starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // 2. Extract the actual token string (it looks like "Bearer eyJhbGci...")
            token = req.headers.authorization.split(" ")[1];

            // 3. Verify the token using our secret key!
            // This will throw an error and go to the "catch" block if the token is fake or expired
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            // 4. Find the user in the database using the ID hidden inside the token
            // We use .select("-password") so we guarantee we NEVER expose the user's password!
            req.user = await User.findById(decoded.id).select("-password");

            // 5. The word "next()" essentially means: "You passed the bouncer, go inside!"
            next();
        } catch (error) {
            console.error("Token verification failed:", error);
            return res.status(401).json({ error: "Not authorized, token failed" });
        }
    }

    // 6. If they never sent a token at all
    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token" });
    }
};