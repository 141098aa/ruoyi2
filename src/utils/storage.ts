const IM_PROFILE_KEY = "im_profile";
const LOCALE_KEY = "app_locale";

interface IMProfile {
  token: string;
  userID: string;
}

const getProfile = (): IMProfile => {
  try {
    return JSON.parse(localStorage.getItem(IM_PROFILE_KEY) || "{}");
  } catch {
    return { token: "", userID: "" };
  }
};

export const setIMProfile = (profile: Partial<IMProfile>) => {
  const nextProfile = { ...getProfile(), ...profile };
  localStorage.setItem(IM_PROFILE_KEY, JSON.stringify(nextProfile));
};

export const getIMToken = () => getProfile().token || "";

export const getIMUserID = () => getProfile().userID || "";

export const clearIMProfile = () => {
  localStorage.removeItem(IM_PROFILE_KEY);
};

export const getLocale = () => localStorage.getItem(LOCALE_KEY) || "zh-cn";

export const setLocale = (locale: string) => {
  localStorage.setItem(LOCALE_KEY, locale);
};

