const dotenv = require('dotenv'); //env 파일 열람

exports.verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

      const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

    if (!token || token !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: '관리자 권한이 없습니다.' });
    }

    next();
};
