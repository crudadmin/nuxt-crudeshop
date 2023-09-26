const cookieTokenKey = 'auth.token';

export const useGetAuthToken = () => {
    return useStorage().get(cookieTokenKey);
};

export const useSetAuthToken = (token) => {
    useStorage().set(cookieTokenKey, token);
};

export const useSetTokenFromCookie = () => {};
export const useAuthToken = () => {};
