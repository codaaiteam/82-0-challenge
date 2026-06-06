export async function getTranslation(locale) {
  try {
    const localTranslation = await import(`@/locales/${locale}.json`);
    return localTranslation.default || localTranslation;
  } catch (error) {
    console.error(`Failed to load translation for ${locale}:`, error);
    const enTranslation = await import('@/locales/en.json');
    return enTranslation.default || enTranslation;
  }
}
