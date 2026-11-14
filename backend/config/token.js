import jwt from "jsonwebtoken";
// generate Token and put it in cookie
const genToken = async (userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.log("Token error:", error.message);
  }
};

export default genToken;