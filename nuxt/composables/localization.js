import Translator from '../../src/utilities/Translator';
import Localization from '../utils/Localization';

export const useTranslatorClass = () => {
    return new Translator(useCrudadminStore().translates);
};

export const useTranslator = (returnClass = false) => {
    return useTranslatorClass().getTranslator();
};

export const useGetLocalesConfig = () => {
    return useRuntimeConfig().public.eshop.locales;
};
export const useGetLocales = () => {
    return useGetLocalesConfig().codes;
};

export const useGetLocaleSlug = () => {
    return Localization.getSlug();
};

export const useGetLocale = () => {
    return Localization.get();
};

export const useSetLocalizedRoutes = (routes) => {
    routes = Localization.initialize().getRewritedRoutes(routes);

    return routes;
};
