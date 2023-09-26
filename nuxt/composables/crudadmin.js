export const useBootstrapResponse = async () => {
    return await useAxios().$get('/api/bootstrap');
};
