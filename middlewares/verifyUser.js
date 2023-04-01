const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) res.status(403).json("Token is not valid");
        req.user = user;
        console.log(user.role)
        next();
      });
    } else {
      return res.status(401).json("You are not authenticated!");
    }
  };
  

  const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "You do not have permission to access this resource",
        });
      }
      
      next();
    });
  };
  


module.exports = { verifyToken, verifyTokenAndAuthorization };
