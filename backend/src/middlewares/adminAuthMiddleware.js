const dotenv = require('dotenv');

exports.verifyAdmin = (req, res, next) => {

    const token = req.headers.authorization;

    console.log(`[AUTH Debug] Header Token: '${token}'`);
    console.log(`[AUTH Debug] Server Token: '${process.env.ADMIN_SECRET_KEY}'`);

    if (!token || token !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: '관리자 권한이 없습니다.' });
    }

    next();
};
