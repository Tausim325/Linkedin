import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({ message: "user doesn't have token" });
    }

    let verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res.status(400).json({ message: "user doesn't have valid token" });
    }

    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    console.log("isAuth error:", error.message);
    return res.status(401).json({ message: "invalid or expired token" });
  }
};

export default isAuth;
