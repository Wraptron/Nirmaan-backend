const LoginModel = require('../../../model/LoginModel');
const {
    setAccessTokenCookie,
    setRefreshTokenCookie,
} = require('../../../utils/authCookies');

const LoginController = async(req, res) => {
    const{user_mail, user_password} = req.body;
    if(user_mail && user_password)
    {
        try
        {
            const result = await LoginModel(user_mail, user_password);
            if(result.status === "Login Authenticated")
            {
                    setAccessTokenCookie(res, result.accessToken);
                    setRefreshTokenCookie(res, result.refreshToken);
                    res.status(200).json({
                        result: {
                            role: result.role,
                            startup_id: result.startup_id,
                            mentor_id: result.mentor_id,
                            user_name: result.user_name,
                            user_mail: result.user_mail,
                            status: result.status,
                        },
                    });
                    return;
            }
            res.status(200).json({ result: { status: result.status } });
        } 
        catch (err)
        {
            
            res.status(500).json({error: 'Internal Server Error', err: err});
        }
    }
    else 
    {
		res.status(202).json({authentication: 'Please enter username and password properly!'})
	}
}
module.exports = LoginController;
