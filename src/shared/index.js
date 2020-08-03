export const appEndpoint = process.env.VUE_APP_ENDPOINT_URL;
export const apiEndpoint = process.env.VUE_APP_API_ENDPOINT_URL;
export const cookieEndpoint = process.env.VUE_APP_COOKIE_ENDPOINT_URL;

export const quMainFields = [
  'avail',
  'price',
  'osale',
];

export const quMoreFields = [
  'minlos',
  'maxlos',
  'carr',
  'cdep',
  'grnt',
];

export const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const langs = [
  { code: 'en', title: 'English' },
  { code: 'de', title: 'German' },
];
export const langCodes = langs.map((l) => l.code);

export default {
  appEndpoint,
  apiEndpoint,
  cookieEndpoint,

  quMainFields,
  quMoreFields,

  langs,
  weekdays,
};
