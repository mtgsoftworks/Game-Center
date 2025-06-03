import en from '../i18n/locales/en/translation.json';
import tr from '../i18n/locales/tr/translation.json';

describe('i18n translation keys', () => {
  it('should have same keys in en and tr translation files', () => {
    const enKeys = Object.keys(en).sort();
    const trKeys = Object.keys(tr).sort();
    expect(enKeys).toEqual(trKeys);
  });
}); 