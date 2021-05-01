// middleware/index.js
import middleware from '../middleware';

middleware['authenticableMiddleware'] = ({ query, $auth, redirect }) => {
    if (query && query.auth_token) {
        $auth.getStrategy('local').token.set(query.auth_token);

        //If no previous path is present we want redirect request will all query params except auth data
        var actualQuery = [];
        for (var key in query) {
            //Skip dannied params
            if (['auth_token', 'expiresIn', 'expires_in'].indexOf(key) > -1) {
                continue;
            }

            actualQuery.push(key + '=' + encodeURI(query[key]));
        }

        redirect(query.previous_path || '/?' + actualQuery.join('&'));
    }
};
